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

    return NextResponse.json({
      documents: userDocuments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

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

    return NextResponse.json({
      id: documentId,
      title: title,
      content,
      contentText,
      wordCount,
      characterCount,
      createdAt: now,
      updatedAt: now
    });

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


