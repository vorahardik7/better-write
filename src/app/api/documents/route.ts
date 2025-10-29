import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db, documents, documentVersions } from '../../../lib/db';
import { syncDocumentToSupermemory } from '../../../lib/supermemory/sync';
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

    // Get user's documents
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
      })
      .from(documents)
      .where(and(
        eq(documents.userId, session.user.id),
        eq(documents.isArchived, false)
      ))
      .orderBy(desc(documents.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ total: count() })
      .from(documents)
      .where(and(
        eq(documents.userId, session.user.id),
        eq(documents.isArchived, false)
      ));

    const total = countResult[0].total;

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

    // Generate content stats from JSON content
    const contentText = extractTextFromJson(content);
    const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = contentText.length;

    const documentId = crypto.randomUUID();
    const now = new Date();

    // Create document
    await db.insert(documents).values({
      id: documentId,
      title: title,
      content: content,
      contentText: contentText,
      userId: session.user.id,
      wordCount: wordCount,
      characterCount: characterCount,
      createdAt: now,
      updatedAt: now,
      lastEditedAt: now,
      isArchived: false,
      isPublic: false,
    });

    // Create initial version
    await db.insert(documentVersions).values({
      id: crypto.randomUUID(),
      documentId: documentId,
      content: content,
      contentText: contentText,
      wordCount: wordCount,
      characterCount: characterCount,
      createdAt: now,
      isAutosave: false,
    });

    // Sync new document to Supermemory (fire-and-forget)
    syncDocumentToSupermemory(documentId, session.user.id).catch(error => {
      console.error('Background sync to Supermemory failed:', error);
    });

    const newDocument = {
      id: documentId,
      title: title,
      content: content,
      contentText,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastEditedAt: now.toISOString(),
      isArchived: false,
      isPublic: false,
      wordCount,
      characterCount,
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

// Helper functions
function extractTextFromJson(jsonContent: any): string {
  if (!jsonContent) return '';
  
  // Recursively extract text from TipTap JSON structure
  function extractText(node: any): string {
    if (typeof node === 'string') return node;
    if (typeof node !== 'object' || !node) return '';
    
    if (node.text) return node.text;
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('');
    }
    
    return '';
  }
  
  return extractText(jsonContent).trim();
}


