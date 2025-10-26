import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { searchDocuments, getRelatedDocuments, searchWithMultipleTags } from '../../../lib/supermemory/search';

/**
 * Semantic search endpoint using Supermemory
 * 
 * GET /api/search?q=query&limit=10&mode=semantic
 * 
 * Query parameters:
 * - q: Search query (required)
 * - limit: Maximum results (default: 10)
 * - mode: 'semantic' or 'related' (default: 'semantic')
 * - documentId: For 'related' mode, find documents related to this one
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const mode = searchParams.get('mode') || 'semantic';
    const documentId = searchParams.get('documentId');
    const containerTag = searchParams.get('containerTag');
    const containerTags = searchParams.get('containerTags')?.split(',').filter(Boolean);

    // Validate query for semantic search
    if (mode === 'semantic' && !query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Validate documentId for related search
    if (mode === 'related' && !documentId) {
      return NextResponse.json(
        { error: 'documentId is required for related mode' },
        { status: 400 }
      );
    }

    let results;

    if (mode === 'related' && documentId) {
      // Find related documents
      results = await getRelatedDocuments(documentId, session.user.id, limit);
    } else if (containerTags && containerTags.length > 0) {
      // Multi-tag search
      results = await searchWithMultipleTags(query || '', session.user.id, containerTags, {
        limit: limit,
        chunkThreshold: 0.6,
        rerank: true,
        rewriteQuery: true,
        onlyMatchingChunks: false
      });
    } else {
      // Single tag or default search
      results = await searchDocuments(query || '', session.user.id, {
        limit: limit,
        chunkThreshold: 0.6,
        rerank: true,
        rewriteQuery: true,
        onlyMatchingChunks: false,
        containerTag: containerTag || undefined
      });
    }

    return NextResponse.json({
      results,
      query: query || undefined,
      mode,
      total: results.length
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for more complex search with filters
 * 
 * POST /api/search
 * Body: {
 *   query: string,
 *   options: SearchOptions
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, options } = body;

    let results;
    
    if (options?.containerTags && options.containerTags.length > 0) {
      // Multi-tag search
      results = await searchWithMultipleTags(query, session.user.id, options.containerTags, {
        limit: options.limit || 10,
        chunkThreshold: options.chunkThreshold || 0.6,
        rerank: options.rerank !== false,
        rewriteQuery: options.rewriteQuery !== false,
        onlyMatchingChunks: options.onlyMatchingChunks || false
      });
    } else {
      // Single tag or default search
      results = await searchDocuments(query, session.user.id, {
        limit: options?.limit || 10,
        chunkThreshold: options?.chunkThreshold || 0.6,
        rerank: options?.rerank !== false,
        rewriteQuery: options?.rewriteQuery !== false,
        onlyMatchingChunks: options?.onlyMatchingChunks || false,
        containerTag: options?.containerTag
      });
    }

    return NextResponse.json({
      results,
      query,
      total: results.length,
      options
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

