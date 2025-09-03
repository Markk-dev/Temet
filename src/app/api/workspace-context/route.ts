import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';
import { Query } from 'node-appwrite';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');
  
  try {

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Get admin client for read-only access (secure server-side only)
    const { databases } = await createAdminClient();

    // Use environment variables for database and collection IDs
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'temet';
    const workspacesId = process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID || 'workspaces';
    const projectsId = process.env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID || 'projects';
    const tasksId = process.env.NEXT_PUBLIC_APPWRITE_TASKS_ID || 'tasks';
    const membersId = process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID || 'members';

    // Fetch workspace data safely
    const workspaceData = await databases.getDocument(
      databaseId,
      workspacesId,
      workspaceId
    );

    // Fetch projects in this workspace
    const projectsResponse = await databases.listDocuments(
      databaseId,
      projectsId,
      [Query.equal("workspaceId", workspaceId)]
    );

    // Fetch tasks in this workspace
    const tasksResponse = await databases.listDocuments(
      databaseId,
      tasksId,
      [Query.equal("workspaceId", workspaceId)]
    );

    // Fetch members in this workspace
    const membersResponse = await databases.listDocuments(
      databaseId,
      membersId,
      [Query.equal("workspaceId", workspaceId)]
    );

    // Get user details for members (names only, no passwords)
    const { users } = await createAdminClient();
    const membersWithNames = await Promise.all(
      membersResponse.documents.map(async (member) => {
        try {
          const user = await users.get(member.userId);
          return {
            id: member.$id,
            name: user.name || 'Unknown User',
            email: user.email,
            role: member.role,
            status: member.status,
            joinedAt: member.$createdAt
          };
        } catch (error) {
          // Fallback if user not found
          return {
            id: member.$id,
            name: 'Unknown User',
            email: 'unknown@example.com',
            role: member.role,
            status: member.status,
            joinedAt: member.$createdAt
          };
        }
      })
    );

    // Create safe context object (no sensitive data)
    const workspaceContext = {
      workspace: {
        id: workspaceData.$id,
        name: workspaceData.name,
        description: workspaceData.description,
        createdAt: workspaceData.$createdAt,
        totalProjects: projectsResponse.total,
        totalTasks: tasksResponse.total,
        totalMembers: membersResponse.total
      },
      projects: projectsResponse.documents.map(project => ({
        id: project.$id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        endDate: project.endDate,
        createdAt: project.$createdAt
      })),
      tasks: tasksResponse.documents.map(task => ({
        id: task.$id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        projectId: task.projectId,
        dueDate: task.dueDate,
        createdAt: task.$createdAt
      })),
      members: membersWithNames,
      analytics: {
        taskStatusDistribution: calculateTaskStatusDistribution(tasksResponse.documents),
        projectStatusDistribution: calculateProjectStatusDistribution(projectsResponse.documents),
        memberRoleDistribution: calculateMemberRoleDistribution(membersResponse.documents),
        overdueTasks: tasksResponse.documents.filter(task => 
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
        ).length,
        completedTasks: tasksResponse.documents.filter(task => task.status === 'completed').length,
        totalTasks: tasksResponse.total
      }
    };

    return NextResponse.json({ data: workspaceContext });

  } catch (error) {
    console.error('Error fetching workspace context:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      workspaceId
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch workspace context',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions for analytics
function calculateTaskStatusDistribution(tasks: any[]) {
  const distribution: { [key: string]: number } = {};
  tasks.forEach(task => {
    distribution[task.status] = (distribution[task.status] || 0) + 1;
  });
  return distribution;
}

function calculateProjectStatusDistribution(projects: any[]) {
  const distribution: { [key: string]: number } = {};
  projects.forEach(project => {
    distribution[project.status] = (distribution[project.status] || 0) + 1;
  });
  return distribution;
}

function calculateMemberRoleDistribution(members: any[]) {
  const distribution: { [key: string]: number } = {};
  members.forEach(member => {
    distribution[member.role] = (distribution[member.role] || 0) + 1;
  });
  return distribution;
}
