import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { DATABASE_ID, CONVERSATIONS_ID, MESSAGES_ID } from '@/config';
import { ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, userId, userName, workspaceId } = body;

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
- Current User: ${userName || 'User'} (ID: ${userId})

PROJECTS:
${data.projects.map((p: any) => `- ${p.name} (${p.status}, ${p.priority} priority)`).join('\n')}

RECENT TASKS:
${data.tasks.slice(0, 10).map((t: any) => `- ${t.title} (${t.status}, assigned to: ${t.assigneeId || 'unassigned'}, priority: ${t.priority || 'medium'}, due: ${t.dueDate || 'no due date'})`).join('\n')}

TASK DETAILS FOR GUIDANCE:
${data.tasks.filter((t: any) => t.status === 'BACKLOG' || t.status === 'IN_PROGRESS').map((t: any) => `- "${t.title}": ${t.description || 'No description provided'}`).join('\n')}

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

IMPORTANT RULES:
- You have READ-ONLY access to workspace data. You can view and analyze but cannot modify anything.
- NEVER show or mention document IDs, user IDs, or any technical database identifiers to users.
- Always refer to users by their names only, never by their IDs.
- Keep technical details internal and user-friendly in your responses.

TASK COMPLETION GUIDANCE:
- When users ask about specific tasks by name (e.g., "how can i complete the task", "help me / guide me with this task"), they want guidance on COMPLETING/DOING that task, not managing it in the system.
- Provide practical, actionable advice on how to complete the specific task.
- Break down complex tasks into manageable steps.
- Offer relevant tips, resources, or methodologies for that type of work.
- If the task name is unclear, ask for clarification about what specific aspect they need help with.

${workspaceContext}`
      },
      {
        role: 'user',
        content: message
      }
    ];

    const freeModels = [
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
      // Provide a helpful fallback response instead of an error
      const fallbackResponse = `I'm currently experiencing high demand and all AI models are temporarily unavailable. 

Please try again in a few minutes when the AI models are available. In the meantime, you can continue working on your tasks!`;

      return NextResponse.json({
        response: fallbackResponse,
        conversationId: conversationId || null,
        fallback: true
      });
    }

    // Store conversation in database
    let currentConversationId = conversationId;
    let isNewConversation = false;
    try {
      const { databases } = await createAdminClient();
      // Use the database and collection IDs from config

      // Create new conversation if none exists
      if (!currentConversationId) {
        const conversationTitle = message.length > 30 ? message.substring(0, 30) + '...' : message;
        
        const newConversation = await databases.createDocument(
          DATABASE_ID,
          CONVERSATIONS_ID,
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
        isNewConversation = true;
      }

      // Save user message
      await databases.createDocument(
        DATABASE_ID,
        MESSAGES_ID, // Messages are stored in separate messages collection
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
        DATABASE_ID,
        MESSAGES_ID, // Messages are stored in separate messages collection
        ID.unique(),
        {
          conversationId: currentConversationId,
          sender: 'ai',
          content: aiResponse,
          timestamp: new Date().toISOString(),
          messageType: 'text'
        }
      );

      // Update conversation last message time (only if it's not a new conversation)
      // Note: This is optional and can fail if conversation was deleted
      if (!isNewConversation) {
        try {
          console.log('Attempting to update conversation timestamp:', currentConversationId);
          await databases.updateDocument(
            DATABASE_ID,
            CONVERSATIONS_ID,
            currentConversationId,
            {
              lastMessageAt: new Date().toISOString()
            }
          );
          console.log('Successfully updated conversation timestamp:', currentConversationId);
        } catch (updateError) {
          console.log('Could not update conversation timestamp (conversation may have been deleted):', currentConversationId);
          // This is not critical - continue without error
        }
      } else {
        console.log('Skipping conversation update for new conversation:', currentConversationId);
      }

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

async function tryModel(apiKey: string, messages: any[], model: string, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
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
        if (response.status === 429 && attempt < retries) {
          // Rate limited - wait with exponential backoff
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          console.log(`Model ${model} rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
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
      if (attempt < retries) {
        console.log(`Model ${model} error, retrying... (attempt ${attempt + 1}/${retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      console.error(`Model ${model} error:`, error);
      return null;
    }
  }
  
  return null;
}
