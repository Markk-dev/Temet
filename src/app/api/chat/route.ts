import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { ID, Query } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, userId, workspaceId } = body;

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Get the OpenRouter API key from environment variables (server-side only)
    const apiKey = process.env.TEMET_CHATBOT;
    
    if (!apiKey) {
      console.error('TEMET_CHATBOT environment variable not found');
      return NextResponse.json(
        { error: 'OpenRouter API key not configured. Please check your .env.local file.' },
        { status: 500 }
      );
    }

    // Get workspace context if workspaceId is provided
    let workspaceContext = '';
    if (workspaceId) {
      try {
        const contextResponse = await fetch(`${request.nextUrl.origin}/api/workspace-context?workspaceId=${workspaceId}`, {
          headers: {
            'Cookie': request.headers.get('Cookie') || ''
          }
        });
        
        if (contextResponse.ok) {
          const { data } = await contextResponse.json();
          workspaceContext = `

CURRENT WORKSPACE CONTEXT:
- Workspace: "${data.workspace.name}" (${data.workspace.totalProjects} projects, ${data.workspace.totalTasks} tasks, ${data.workspace.totalMembers} members)

PROJECTS:
${data.projects.map((p: any) => `- ${p.name} (${p.status}, ${p.priority} priority)`).join('\n')}

RECENT TASKS:
${data.tasks.slice(0, 10).map((t: any) => `- ${t.title} (${t.status}, assigned to: ${t.assigneeId || 'unassigned'})`).join('\n')}

TEAM MEMBERS:
${data.members.map((m: any) => `- ${m.name} (${m.role})`).join('\n')}

ANALYTICS:
- Task Status: ${JSON.stringify(data.analytics.taskStatusDistribution)}
- Overdue Tasks: ${data.analytics.overdueTasks}
- Completed Tasks: ${data.analytics.completedTasks}/${data.analytics.totalTasks}
- Project Status: ${JSON.stringify(data.analytics.projectStatusDistribution)}

You can help with:
- Task management and prioritization
- Project planning and status updates
- Team coordination and workload distribution
- Analytics insights and recommendations
- Workflow optimization suggestions`;
        } else {
          // Fallback: Basic workspace context without detailed data
          workspaceContext = `

WORKSPACE CONTEXT:
- You are helping with workspace ID: ${workspaceId}
- The user is working in a project management workspace
- You can provide general project management advice and guidance

You can help with:
- General task management strategies
- Project planning best practices
- Team collaboration tips
- Workflow optimization suggestions
- Productivity recommendations`;
        }
      } catch (error) {
        console.error('Failed to fetch workspace context:', error);
        // Fallback: Basic workspace context
        workspaceContext = `

WORKSPACE CONTEXT:
- You are helping with workspace ID: ${workspaceId}
- The user is working in a project management workspace
- You can provide general project management advice and guidance

You can help with:
- General task management strategies
- Project planning best practices
- Team collaboration tips
- Workflow optimization suggestions
- Productivity recommendations`;
      }
    }

    const messages = [
      {
        role: 'system',
        content: `You are Temet, an AI assistant for a project management platform. 

Your personality:
- Be helpful, concise, and professional
- Use a friendly but efficient tone
- Keep responses brief unless asked for detailed information
- Only provide workspace insights when specifically requested
- Match the user's energy - if they say "hi", respond with a simple greeting

IMPORTANT: You have READ-ONLY access to workspace data. You can view and analyze but cannot modify anything.${workspaceContext}`
      },
      {
        role: 'user',
        content: message
      }
    ];

    const freeModels = [
      'google/gemini-2.5-flash-image-preview:free',
      'deepseek/deepseek-chat-v3.1:free',
      'openai/gpt-oss-20b:free',
      'qwen/qwen3-coder:free',
      'mistralai/mistral-small-3.2-24b-instruct:free',
      'qwen/qwen3-4b:free',
      'meta-llama/llama-4-maverick:free',
      'moonshotai/kimi-dev-72b:free',
      'google/gemma-3n-e2b-it:free',
      'openai/gpt-oss-120b:free'
    ];

    // Try each model in order until one succeeds
    let aiResponse = null;
    for (const model of freeModels) {
      aiResponse = await tryModel(apiKey, messages, model);
      if (aiResponse) {
        console.log(`Successfully used model: ${model}`);
        break;
      }
    }

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'All free AI models failed to respond. Please try again later.' },
        { status: 500 }
      );
    }

    // Store conversation in database
    let currentConversationId = conversationId;
    try {
      const { databases } = await createAdminClient();
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'temet';
      const conversationsId = process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_ID || 'conversations';
      const messagesId = process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_ID || 'messages';

      // Create new conversation if none exists
      if (!currentConversationId) {
        const conversationTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
        
        const newConversation = await databases.createDocument(
          databaseId,
          conversationsId,
          ID.unique(),
          {
            userId: userId || 'anonymous',
            sessionId: `session_${Date.now()}`,
            title: conversationTitle,
            lastMessageAt: new Date().toISOString(),
            workspaceId: workspaceId || null
          }
        );
        currentConversationId = newConversation.$id;
      }

      // Save user message
      await databases.createDocument(
        databaseId,
        messagesId,
        ID.unique(),
        {
          conversationId: currentConversationId,
          sender: 'user',
          content: message,
          timestamp: new Date().toISOString(),
          messageType: 'text'
        }
      );

      // Save AI response
      await databases.createDocument(
        databaseId,
        messagesId,
        ID.unique(),
        {
          conversationId: currentConversationId,
          sender: 'ai',
          content: aiResponse,
          timestamp: new Date().toISOString(),
          messageType: 'text'
        }
      );

      // Update conversation last message time
      await databases.updateDocument(
        databaseId,
        conversationsId,
        currentConversationId,
        {
          lastMessageAt: new Date().toISOString()
        }
      );

    } catch (dbError) {
      console.error('Database storage error:', dbError);
      // Continue even if database storage fails
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: currentConversationId,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function tryModel(apiKey: string, messages: any[], model: string): Promise<string | null> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://temet.app',
        'X-Title': 'Temet AI Assistant',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 800,        // Reduced for more concise responses
        temperature: 0.6,       // Slightly more focused/consistent
        top_p: 0.9,            // Nucleus sampling for better quality
        frequency_penalty: 0.1, // Reduce repetition
        presence_penalty: 0.1,  // Encourage new topics
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Model ${model} failed with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error(`Model ${model} returned no content`);
      return null;
    }

    return aiResponse;

  } catch (error) {
    console.error(`Model ${model} error:`, error);
    return null;
  }
}
