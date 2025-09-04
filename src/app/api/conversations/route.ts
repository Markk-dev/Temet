import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const workspaceId = searchParams.get('workspaceId');

    const { databases } = await createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'temet';
    const conversationsId = process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_ID || 'conversations';

    // Build query filters
    const queries = [Query.equal('userId', userId)];
    if (workspaceId) {
      queries.push(Query.equal('workspaceId', workspaceId));
    }

    // Get conversations sorted by last message time
    const conversations = await databases.listDocuments(
      databaseId,
      conversationsId,
      [
        ...queries,
        Query.orderDesc('lastMessageAt'),
        Query.limit(50) // Limit to 50 most recent conversations
      ]
    );

    return NextResponse.json({
      conversations: conversations.documents.map(conv => ({
        id: conv.$id,
        title: conv.title,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.$createdAt,
        workspaceId: conv.workspaceId
      }))
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
