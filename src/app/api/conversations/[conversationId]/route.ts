import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;

    const { databases } = await createAdminClient();
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'temet';
    const conversationsId = process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_ID || 'conversations';
    const messagesId = process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_ID || 'messages';

    // First, delete all messages in this conversation (cascade delete)
    try {
      const messages = await databases.listDocuments(
        databaseId,
        messagesId,
        [Query.equal('conversationId', conversationId)]
      );

      // Delete each message
      for (const message of messages.documents) {
        await databases.deleteDocument(
          databaseId,
          messagesId,
          message.$id
        );
      }

      console.log(`Deleted ${messages.documents.length} messages for conversation ${conversationId}`);
    } catch (messageError) {
      console.error('Error deleting messages:', messageError);
      // Continue with conversation deletion even if message deletion fails
    }

    // Then delete the conversation itself
    await databases.deleteDocument(
      databaseId,
      conversationsId,
      conversationId
    );

    console.log(`Deleted conversation ${conversationId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Conversation and all related messages deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
