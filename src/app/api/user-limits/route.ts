import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { getUserUsageStats } from '../../../lib/user-limits';
import { withUserContext } from '../../../lib/db-context';

/**
 * Get user limits and usage statistics
 * 
 * GET /api/user-limits
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usageStats = await withUserContext(session.user.id, async () => {
      return await getUserUsageStats(session.user.id);
    });

    return NextResponse.json({
      limits: {
        maxDocuments: usageStats.maxDocuments,
        maxDocumentSizeBytes: usageStats.maxDocumentSizeBytes,
        maxDocumentPages: usageStats.maxDocumentPages,
      },
      usage: usageStats.usage,
      remaining: {
        documents: usageStats.usage.documentLimitRemaining,
        storagePerDocument: usageStats.maxDocumentSizeBytes,
        pagesPerDocument: usageStats.maxDocumentPages,
      }
    });

  } catch (error) {
    console.error('Error fetching user limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user limits' },
      { status: 500 }
    );
  }
}
