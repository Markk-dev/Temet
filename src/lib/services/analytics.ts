import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, TASKS_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { TimeLog, TaskStatus } from "@/features/tasks/types";

interface MemberTimeAnalyticsParams {
  workspaceId: string;
}

interface MemberDailyTime {
  date: string;
  seconds: number;
}

interface MemberAnalytics {
  id: string;
  name: string;
  email: string;
  totalTimeSpent: number; 
  dailyTime: MemberDailyTime[];
}

export async function getMemberTimeAnalytics({
  workspaceId,
}: MemberTimeAnalyticsParams): Promise<{ members: MemberAnalytics[] }> {
  try {
    const { databases } = await createSessionClient();
    const { users } = await createAdminClient();

    
    const membersResult = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("workspaceId", workspaceId)]
    );

    
    const tasksResult = await databases.listDocuments(
      DATABASE_ID,
      TASKS_ID,
      [
        Query.equal("workspaceId", workspaceId),
        Query.equal("status", TaskStatus.DONE)
      ]
    );

    
    const memberAnalytics: Record<string, MemberAnalytics> = {};
    
    
    for (const member of membersResult.documents) {
      try {
        const user = await users.get(member.userId);
        memberAnalytics[member.$id] = {
          id: member.$id,
          name: user.name || user.email || 'Unknown Member',
          email: user.email || '',
          totalTimeSpent: 0,
          dailyTime: [],
        };
      } catch {
        
        memberAnalytics[member.$id] = {
          id: member.$id,
          name: 'Unknown Member',
          email: '',
          totalTimeSpent: 0,
          dailyTime: [],
        };
      }
    }

    
    tasksResult.documents.forEach(task => {
      let timeLogs: TimeLog[] = [];
      try {
        timeLogs = task.timeLogs ? JSON.parse(task.timeLogs as string) : [];
      } catch {
        return; 
      }

      
      const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
      
      
      let taskTotalTime = 0;
      const taskDailyTime: Record<string, number> = {}; 

      timeLogs.forEach((log: TimeLog) => {
        if (!log.ended_at || !log.started_at) return; 

        const duration = (new Date(log.ended_at).getTime() - new Date(log.started_at).getTime()) / 1000;
        const date = log.started_at.split('T')[0]; 
        
        taskTotalTime += duration;
        taskDailyTime[date] = (taskDailyTime[date] || 0) + duration;
      });

      
      const timePerMember = taskTotalTime / assigneeIds.length;
      
      assigneeIds.forEach(assigneeId => {
        if (!memberAnalytics[assigneeId]) return; 
        
        
        memberAnalytics[assigneeId].totalTimeSpent += timePerMember;
        
        
        Object.entries(taskDailyTime).forEach(([date, dayTime]) => {
          const dailyTimePerMember = dayTime / assigneeIds.length;
          
          const member = memberAnalytics[assigneeId];
          const dayIndex = member.dailyTime.findIndex(d => d.date === date);
          
          if (dayIndex >= 0) {
            member.dailyTime[dayIndex].seconds += dailyTimePerMember;
          } else {
            member.dailyTime.push({ date, seconds: dailyTimePerMember });
          }
        });
      });
    });

    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    Object.values(memberAnalytics).forEach(member => {
      last7Days.forEach(date => {
        if (!member.dailyTime.some(d => d.date === date)) {
          member.dailyTime.push({ date, seconds: 0 });
        }
      });
      
      member.dailyTime.sort((a, b) => a.date.localeCompare(b.date));
    });

    return {
      members: Object.values(memberAnalytics)
    };
  } catch (error) {
    console.error('Error in getMemberTimeAnalytics:', error);
    throw new Error('Failed to fetch member time analytics');
  }
}
