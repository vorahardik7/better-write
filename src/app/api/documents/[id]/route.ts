import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { db } from '../../../../lib/db';
import type { TipTapContent, TipTapNode, TipTapMark } from '../../../../types/editor';

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
    const document = await db.query(`
      SELECT 
        id,
        title,
        content,
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
      WHERE id = $1 AND "userId" = $2
    `, [id, session.user.id]);

    if (document.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document.rows[0]);

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

    // Update document
    const result = await db.query(`
      UPDATE document 
      SET 
        title = $1,
        content = $2,
        "contentHtml" = $3,
        "contentText" = $4,
        "wordCount" = $5,
        "characterCount" = $6,
        "updatedAt" = $7,
        "lastEditedAt" = $8
      WHERE id = $9 AND "userId" = $10
      RETURNING *
    `, [
      title,
      JSON.stringify(content),
      contentHtml,
      contentText,
      wordCount,
      characterCount,
      new Date(),
      new Date(),
      id,
      session.user.id
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Create version if not autosave
    if (!isAutosave) {
      await db.query(`
        INSERT INTO document_version (
          id, "documentId", content, "contentHtml", "contentText",
          "wordCount", "characterCount", "createdAt", "isAutosave"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        crypto.randomUUID(),
        id,
        JSON.stringify(content),
        contentHtml,
        contentText,
        wordCount,
        characterCount,
        new Date(),
        false
      ]);
    }

    return NextResponse.json({
      id,
      title,
      content,
      contentHtml,
      contentText,
      wordCount,
      characterCount,
      updatedAt: new Date()
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

    // Archive document instead of deleting
    const result = await db.query(`
      UPDATE document 
      SET "isArchived" = true, "updatedAt" = $1
      WHERE id = $2 AND "userId" = $3
      RETURNING id
    `, [new Date(), id, session.user.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
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

// Helper functions (same as in route.ts)
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

