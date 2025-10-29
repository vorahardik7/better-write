import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { db, documents, documentVersions } from '../../../../lib/db';
import { syncDocumentToSupermemory, removeDocumentFromSupermemory } from '../../../../lib/supermemory/sync';
import { calculateContentMetrics } from '../../../../lib/content-utils';
import { checkDocumentUpdateLimits, updateLimitsAfterDocumentUpdate, updateLimitsAfterDocumentDeletion } from '../../../../lib/user-limits';
import { withUserContext } from '../../../../lib/db-context';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Use RLS context for secure document access
    const result = await withUserContext(session.user.id, async () => {
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);

      return document[0];
    });

    if (!result) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const doc = result;
    
    // Parse JSON content if it exists, otherwise return empty document
    let jsonContent;
    try {
      jsonContent = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
    } catch (error) {
      console.error('Failed to parse document content:', error);
      jsonContent = { type: 'doc', content: [{ type: 'paragraph', content: [] }] };
    }

    // Generate ETag for cache validation
    const etag = `"${doc.id}-${new Date(doc.updatedAt).getTime()}"`;

    // Check if client has cached version
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    const response = NextResponse.json({
      ...doc,
      content: jsonContent
    });

    // Set caching headers
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=30');
    response.headers.set('ETag', etag);
    response.headers.set('Last-Modified', new Date(doc.updatedAt).toUTCString());
    response.headers.set('Vary', 'Authorization');

    return response;

  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, isAutosave = false } = body;

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

    // Calculate new content metrics
    const metrics = calculateContentMetrics(content);

    // Check update limits
    const limitCheck = await checkDocumentUpdateLimits(session.user.id, content, id);
    
    if (!limitCheck.canUpdateDocument) {
      return NextResponse.json(
        { 
          error: 'Document update limit exceeded',
          details: limitCheck.errors,
          limits: {
            maxSizePerDocument: limitCheck.maxStoragePerDocument,
            maxPagesPerDocument: limitCheck.maxPagesPerDocument,
          }
        },
        { status: 403 }
      );
    }

    const now = new Date();

    // Use RLS context and transaction for data integrity
    const result = await withUserContext(session.user.id, async () => {
      // Get current document to check old size
      const currentDoc = await db
        .select({
          contentSizeBytes: documents.contentSizeBytes,
        })
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);

      if (currentDoc.length === 0) {
        throw new Error('Document not found');
      }

      const oldSizeBytes = currentDoc[0].contentSizeBytes || 0;

      // Update document
      const [updatedDoc] = await db
        .update(documents)
        .set({
          title: title,
          content: content,
          contentText: metrics.contentText,
          wordCount: metrics.wordCount,
          characterCount: metrics.characterCount,
          pageCount: metrics.pageCount,
          contentSizeBytes: metrics.contentSizeBytes,
          updatedAt: now,
          lastEditedAt: now,
        })
        .where(eq(documents.id, id))
        .returning();

      // Create version if not autosave
      if (!isAutosave) {
        await db.insert(documentVersions).values({
          id: crypto.randomUUID(),
          documentId: id,
          content: content,
          contentText: metrics.contentText,
          wordCount: metrics.wordCount,
          characterCount: metrics.characterCount,
          pageCount: metrics.pageCount,
          contentSizeBytes: metrics.contentSizeBytes,
          createdAt: now,
          isAutosave: false,
        });
      }

      return { updatedDoc, oldSizeBytes };
    });

    if (!result.updatedDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update user limits after successful update
    await updateLimitsAfterDocumentUpdate(session.user.id, result.oldSizeBytes, metrics.contentSizeBytes);

    // Sync to Supermemory after manual save (not autosave)
    if (!isAutosave) {
      syncDocumentToSupermemory(id, session.user.id).catch(error => {
        console.error('Background sync to Supermemory failed:', error);
      });
    }

    const response = NextResponse.json({
      id,
      title: title,
      content,
      contentText: metrics.contentText,
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      pageCount: metrics.pageCount,
      contentSizeBytes: metrics.contentSizeBytes,
      updatedAt: now
    });

    // Set cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache');
    response.headers.set('X-Cache-Invalidated', 'true');

    return response;

  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Use RLS context for secure document access
    const result = await withUserContext(session.user.id, async () => {
      // Get document details before archiving
      const docResult = await db
        .select({
          id: documents.id,
          contentSizeBytes: documents.contentSizeBytes,
          supermemoryDocId: documents.supermemoryDocId,
        })
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);

      if (docResult.length === 0) {
        throw new Error('Document not found');
      }

      const doc = docResult[0];

      // Archive document instead of deleting
      const now = new Date();
      const updateResult = await db
        .update(documents)
        .set({
          isArchived: true,
          updatedAt: now,
        })
        .where(eq(documents.id, id))
        .returning({ id: documents.id });

      if (updateResult.length === 0) {
        throw new Error('Document not found');
      }

      return { doc, updateResult };
    });

    // Update user limits after archiving
    await updateLimitsAfterDocumentDeletion(session.user.id, result.doc.contentSizeBytes || 0);

    // Delete from Supermemory (fire-and-forget)
    if (result.doc.supermemoryDocId) {
      removeDocumentFromSupermemory(id, session.user.id).catch((error: any) => {
        console.error('Failed to delete from Supermemory:', error);
      });
    }

    const response = NextResponse.json({ success: true });
    
    // Set cache invalidation headers
    response.headers.set('Cache-Control', 'no-cache');
    response.headers.set('X-Cache-Invalidated', 'true');

    return response;

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}



