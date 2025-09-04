import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    const { databases } = await createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'temet';
    const messagesId = process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_ID || 'messages';

    // Get messages for this conversation
    const messages = await databases.listDocuments(
      databaseId,
      messagesId,
      [
        Query.equal('conversationId', conversationId),
        Query.orderAsc('timestamp')
      ]
    );

    return NextResponse.json({
      messages: messages.documents.map(msg => ({
        id: msg.$id,
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
        messageType: msg.messageType
      }))
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
