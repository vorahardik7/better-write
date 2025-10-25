import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { searchDocuments, getRelatedDocuments, searchWithMultipleTags } from '../../../lib/supermemory/search';
import { 
  validateSearchQuery, 
  validateLimit, 
  validateDocumentId,
  logSecurityEvent, 
  checkRateLimit 
} from '../../../lib/security';

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
      logSecurityEvent('unauthorized_search_attempt', { endpoint: '/api/search' }, undefined, request);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimit = checkRateLimit(session.user.id, 30, 60000); // 30 requests per minute
    if (!rateLimit.allowed) {
      logSecurityEvent('rate_limit_exceeded', { 
        userId: session.user.id, 
        endpoint: '/api/search' 
      }, session.user.id, request);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const mode = searchParams.get('mode') || 'semantic';
    const documentId = searchParams.get('documentId');
    const containerTag = searchParams.get('containerTag');
    const containerTags = searchParams.get('containerTags')?.split(',').filter(Boolean);

    // Input validation using security utilities
    const validationErrors: string[] = [];
    
    const validatedQuery = query ? validateSearchQuery(query) : null;
    if (query && !validatedQuery) {
      validationErrors.push('Invalid search query');
    }
    
    const validatedLimit = validateLimit(limit);
    if (!validatedLimit) {
      validationErrors.push('Limit must be between 1 and 100');
    }
    
    if (mode && !['semantic', 'related'].includes(mode)) {
      validationErrors.push('Mode must be either "semantic" or "related"');
    }
    
    if (documentId && !validateDocumentId(documentId)) {
      validationErrors.push('Document ID must be a valid UUID');
    }
    
    if (validationErrors.length > 0) {
      logSecurityEvent('validation_failed', { 
        errors: validationErrors, 
        endpoint: '/api/search' 
      }, session.user.id, request);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Validate query for semantic search
    if (mode === 'semantic' && !validatedQuery) {
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
      results = await getRelatedDocuments(documentId, session.user.id, validatedLimit || 10);
    } else if (containerTags && containerTags.length > 0) {
      // Multi-tag search
      results = await searchWithMultipleTags(validatedQuery || '', session.user.id, containerTags, {
        limit: validatedLimit || 10,
        chunkThreshold: 0.6,
        rerank: true,
        rewriteQuery: true,
        onlyMatchingChunks: false
      });
    } else {
      // Single tag or default search
      results = await searchDocuments(validatedQuery || '', session.user.id, {
        limit: validatedLimit || 10,
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
    const { query, options = {} } = body;

    // Input validation
    const validationErrors: string[] = [];
    
    if (!query || typeof query !== 'string') {
      validationErrors.push('Search query is required and must be a string');
    } else if (query.length > 500) {
      validationErrors.push('Search query is too long (max 500 characters)');
    }
    
    if (options && typeof options === 'object') {
      if (options.limit && (typeof options.limit !== 'number' || options.limit < 1 || options.limit > 100)) {
        validationErrors.push('Limit must be a number between 1 and 100');
      }
      if (options.containerTags && (!Array.isArray(options.containerTags) || options.containerTags.length > 10)) {
        validationErrors.push('Container tags must be an array with max 10 items');
      }
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    let results;
    
    if (options.containerTags && options.containerTags.length > 0) {
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
        limit: options.limit || 10,
        chunkThreshold: options.chunkThreshold || 0.6,
        rerank: options.rerank !== false,
        rewriteQuery: options.rewriteQuery !== false,
        onlyMatchingChunks: options.onlyMatchingChunks || false,
        containerTag: options.containerTag
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

