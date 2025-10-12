import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { db } from '../../../lib/db';
import type { TipTapContent, TipTapNode, TipTapMark } from '../../../types/editor';

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
    const documents = await db.query(`
      SELECT 
        id,
        title,
        "contentHtml" as "contentHtml",
        "contentText" as "contentText",
        "createdAt" as "createdAt",
        "updatedAt" as "updatedAt",
        "lastEditedAt" as "lastEditedAt",
        "isArchived" as "isArchived",
        "isPublic" as "isPublic",
        "wordCount" as "wordCount",
        "characterCount" as "characterCount"
      FROM document 
      WHERE "userId" = $1 AND "isArchived" = false
      ORDER BY "updatedAt" DESC
      LIMIT $2 OFFSET $3
    `, [session.user.id, limit, offset]);

    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM document 
      WHERE "userId" = $1 AND "isArchived" = false
    `, [session.user.id]);

    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      documents: documents.rows,
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

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate content stats
    const contentText = extractTextFromTipTap(content);
    const wordCount = contentText.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = contentText.length;
    const contentHtml = renderTipTapToHtml(content);

    const documentId = crypto.randomUUID();

    // Create document
    await db.query(`
      INSERT INTO document (
        id, title, content, "contentHtml", "contentText", "userId",
        "wordCount", "characterCount", "createdAt", "updatedAt", "lastEditedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      documentId,
      title,
      JSON.stringify(content),
      contentHtml,
      contentText,
      session.user.id,
      wordCount,
      characterCount,
      new Date(),
      new Date(),
      new Date()
    ]);

    // Create initial version
    await db.query(`
      INSERT INTO document_version (
        id, "documentId", content, "contentHtml", "contentText",
        "wordCount", "characterCount", "createdAt", "isAutosave"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      crypto.randomUUID(),
      documentId,
      JSON.stringify(content),
      contentHtml,
      contentText,
      wordCount,
      characterCount,
      new Date(),
      false
    ]);

    return NextResponse.json({
      id: documentId,
      title,
      content,
      contentHtml,
      contentText,
      wordCount,
      characterCount,
      createdAt: new Date(),
      updatedAt: new Date()
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
function extractTextFromTipTap(content: TipTapContent): string {
  if (!content || !content.content) return '';

  function extractText(node: TipTapNode): string {
    if (node.type === 'text') {
      return node.text || '';
    }

    if (node.content) {
      return node.content.map(extractText).join('');
    }

    return '';
  }

  return content.content.map(extractText).join(' ');
}

function renderTipTapToHtml(content: TipTapContent): string {
  // This is a simplified HTML renderer
  // In production, you might want to use a proper TipTap HTML renderer
  if (!content || !content.content) return '';

  function renderNode(node: TipTapNode): string {
    if (node.type === 'text') {
      const text = node.text || '';
      if (node.marks) {
        let processedText = text;
        node.marks.forEach((mark: TipTapMark) => {
          switch (mark.type) {
            case 'bold':
              processedText = `<strong>${processedText}</strong>`;
              break;
            case 'italic':
              processedText = `<em>${processedText}</em>`;
              break;
            case 'underline':
              processedText = `<u>${processedText}</u>`;
              break;
          }
        });
        return processedText;
      }
      return text;
    }

    if (node.content) {
      const innerHtml = node.content.map(renderNode).join('');

      switch (node.type) {
        case 'paragraph':
          return `<p>${innerHtml}</p>`;
        case 'heading':
          const level = node.attrs?.level || 1;
          return `<h${level}>${innerHtml}</h${level}>`;
        case 'bulletList':
          return `<ul>${innerHtml}</ul>`;
        case 'orderedList':
          return `<ol>${innerHtml}</ol>`;
        case 'listItem':
          return `<li>${innerHtml}</li>`;
        default:
          return innerHtml;
      }
    }

    return '';
  }

  return content.content.map(renderNode).join('');
}

