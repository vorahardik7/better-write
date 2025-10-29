import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db, documents, documentVersions } from '../../../lib/db';
import { syncDocumentToSupermemory } from '../../../lib/supermemory/sync';
import { calculateContentMetrics } from '../../../lib/content-utils';
import { checkDocumentCreationLimits, updateLimitsAfterDocumentCreation } from '../../../lib/user-limits';
import { withUserContext } from '../../../lib/db-context';
import { eq, desc, count, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Use RLS context for secure document access
    const result = await withUserContext(session.user.id, async () => {
      // Get user's documents (RLS will automatically filter)
      const userDocuments = await db
        .select({
          id: documents.id,
          title: documents.title,
          content: documents.content,
          contentText: documents.contentText,
          createdAt: documents.createdAt,
          updatedAt: documents.updatedAt,
          lastEditedAt: documents.lastEditedAt,
          isArchived: documents.isArchived,
          isPublic: documents.isPublic,
          wordCount: documents.wordCount,
          characterCount: documents.characterCount,
          pageCount: documents.pageCount,
          contentSizeBytes: documents.contentSizeBytes,
        })
        .from(documents)
        .where(eq(documents.isArchived, false))
        .orderBy(desc(documents.updatedAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const countResult = await db
        .select({ total: count() })
        .from(documents)
        .where(eq(documents.isArchived, false));

      return {
        documents: userDocuments,
        total: countResult[0].total,
      };
    });

    const { documents: userDocuments, total } = result;

    // Generate ETag for cache validation
    const generateETag = (docs: typeof userDocuments) => {
      if (docs.length === 0) return '"empty"';
      const latestUpdate = Math.max(
        ...docs.map(doc => new Date(doc.updatedAt).getTime())
      );
      return `"${docs.length}-${latestUpdate}"`;
    };

    const etag = generateETag(userDocuments);

    // Check if client has cached version
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    const response = NextResponse.json({
      documents: userDocuments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

    // Set caching headers
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
    response.headers.set('ETag', etag);
    response.headers.set('Last-Modified', new Date().toUTCString());
    response.headers.set('Vary', 'Authorization');

    return response;

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { error: 'Title must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Calculate content metrics
    const metrics = calculateContentMetrics(content);

    // Check user limits
    const limitCheck = await checkDocumentCreationLimits(session.user.id, content);
    
    if (!limitCheck.canCreateDocument) {
      return NextResponse.json(
        { 
          error: 'Document creation limit exceeded',
          details: limitCheck.errors,
          limits: {
            currentDocuments: limitCheck.currentDocumentCount,
            maxDocuments: limitCheck.maxDocuments,
            maxSizePerDocument: limitCheck.maxStoragePerDocument,
            maxPagesPerDocument: limitCheck.maxPagesPerDocument,
          }
        },
        { status: 403 }
      );
    }

    const documentId = crypto.randomUUID();
    const now = new Date();

    // Use RLS context and transaction for data integrity
    const result = await withUserContext(session.user.id, async () => {
      return await db.transaction(async (tx) => {
        // Create document
        const [newDoc] = await tx.insert(documents).values({
          id: documentId,
          title: title,
          content: content,
          contentText: metrics.contentText,
          userId: session.user.id,
          wordCount: metrics.wordCount,
          characterCount: metrics.characterCount,
          pageCount: metrics.pageCount,
          contentSizeBytes: metrics.contentSizeBytes,
          createdAt: now,
          updatedAt: now,
          lastEditedAt: now,
          isArchived: false,
          isPublic: false,
          syncStatus: 'pending',
        }).returning();

        // Create initial version
        await tx.insert(documentVersions).values({
          id: crypto.randomUUID(),
          documentId: documentId,
          content: content,
          contentText: metrics.contentText,
          wordCount: metrics.wordCount,
          characterCount: metrics.characterCount,
          pageCount: metrics.pageCount,
          contentSizeBytes: metrics.contentSizeBytes,
          createdAt: now,
          isAutosave: false,
        });

        return newDoc;
      });
    });

    // Update user limits after successful creation
    await updateLimitsAfterDocumentCreation(session.user.id, metrics.contentSizeBytes);

    // Sync new document to Supermemory (fire-and-forget)
    syncDocumentToSupermemory(documentId, session.user.id).catch(error => {
      console.error('Background sync to Supermemory failed:', error);
    });

    const newDocument = {
      id: documentId,
      title: title,
      content: content,
      contentText: metrics.contentText,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastEditedAt: now.toISOString(),
      isArchived: false,
      isPublic: false,
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      pageCount: metrics.pageCount,
      contentSizeBytes: metrics.contentSizeBytes,
    };

    const response = NextResponse.json(newDocument);

    // Set cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache');
    response.headers.set('X-Cache-Invalidated', 'true');

    return response;

  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}



