import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { db, documents, documentVersions } from '../../../../lib/db';
import { syncDocumentToSupermemory, removeDocumentFromSupermemory } from '../../../../lib/supermemory/sync';
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
    
    // Use database connection (RLS handled by Supabase)
    const document = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)))
      .limit(1);

    if (document.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const doc = document[0];
    
    // Parse JSON content if it exists, otherwise return empty document
    let jsonContent;
    try {
      jsonContent = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
    } catch (error) {
      console.error('Failed to parse document content:', error);
      jsonContent = { type: 'doc', content: [{ type: 'paragraph', content: [] }] };
    }

    return NextResponse.json({
      ...doc,
      content: jsonContent
    });

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

    // Generate content stats from JSON content
    const contentText = extractTextFromJson(content);
    const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = contentText.length;
    
    // Use database connection (RLS handled by Supabase)
    const now = new Date();
    const result = await db
      .update(documents)
      .set({
        title: title,
        content: content,
        contentText: contentText,
        wordCount: wordCount,
        characterCount: characterCount,
        updatedAt: now,
        lastEditedAt: now,
      })
      .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Create version if not autosave
    if (!isAutosave) {
      await db.insert(documentVersions).values({
        id: crypto.randomUUID(),
        documentId: id,
        content: content,
        contentText: contentText,
        wordCount: wordCount,
        characterCount: characterCount,
        createdAt: now,
        isAutosave: false,
      });

      // Sync to Supermemory after manual save (not autosave)
      // Fire-and-forget to not block response
      syncDocumentToSupermemory(id, session.user.id).catch(error => {
        console.error('Background sync to Supermemory failed:', error);
      });
    }

    return NextResponse.json({
      id,
      title: title,
      content,
      contentText,
      wordCount,
      characterCount,
      updatedAt: now
    });

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

    // Use database connection (RLS handled by Supabase)
    // Get supermemoryDocId before archiving
    const docResult = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)))
      .limit(1);

    // Archive document instead of deleting using Drizzle
    const now = new Date();
    const result = await db
      .update(documents)
      .set({
        isArchived: true,
        updatedAt: now,
      })
      .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)))
      .returning({ id: documents.id });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from Supermemory (fire-and-forget)
    if (docResult.length > 0 && (docResult[0] as any).supermemoryDocId) {
      removeDocumentFromSupermemory(id, session.user.id).catch((error: any) => {
        console.error('Failed to delete from Supermemory:', error);
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
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


