import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, TASKS_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { TimeLog } from "@/features/tasks/types";

export interface MemberAnalytics {
  id: string;
  name: string;
  email: string;
  totalTimeSpent: number; 
  dailyTime: MemberDailyTime[];
}

interface MemberTimeAnalyticsParams {
  workspaceId: string;
}

interface MemberDailyTime {
  date: string;
  seconds: number;
}

export async function getMemberTimeAnalytics({
  workspaceId,
}: MemberTimeAnalyticsParams): Promise<{ members: MemberAnalytics[] }> {
  try {
    const startTime = Date.now();
    const { databases } = await createSessionClient();
    const { users } = await createAdminClient();

    
    const [membersResult, tasksResult] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId", workspaceId)]
      ),
      databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.limit(1000)
        ]
      )
    ]);

    const memberAnalytics: Record<string, MemberAnalytics> = {};
    
    
    const uniqueUserIds = [...new Set(membersResult.documents.map(member => member.userId))];
    const usersMap = new Map();
    
    
    if (uniqueUserIds.length > 0) {
      // Fetch users individually for reliability
      const userPromises = uniqueUserIds.map(async (userId) => {
        try {
          const user = await users.get(userId);
          return [userId, user];
        } catch (error) {
          return [userId, { name: "Unknown Member", email: "", $id: userId }];
        }
      });
      
      const userResults = await Promise.allSettled(userPromises);
      userResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const [userId, user] = result.value;
          usersMap.set(userId, user);
        }
      });
    }

    
    for (const member of membersResult.documents) {
      const user = usersMap.get(member.userId) || { 
        name: "Unknown Member", 
        email: "" 
      };
      
      
      memberAnalytics[member.$id] = {
        id: member.$id,
        name: user.name || user.email || 'Unknown Member',
        email: user.email || '',
        totalTimeSpent: 0,
        dailyTime: [],
      };
    }


    tasksResult.documents.forEach(task => {
      let timeLogs: TimeLog[] = [];
      try {
        timeLogs = task.timeLogs ? JSON.parse(task.timeLogs as string) : [];
      } catch (error) {
        console.error(`Failed to parse time logs for task ${task.$id}:`, error);
        return; 
      }

      if (timeLogs.length === 0) return; 
      
      const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
      let taskTotalTime = 0;
      const taskDailyTime: Record<string, number> = {}; 

      
      timeLogs.forEach((log: TimeLog) => {
        if (!log.started_at) return; 

        const endTime = log.ended_at || new Date().toISOString();
        const duration = (new Date(endTime).getTime() - new Date(log.started_at).getTime()) / 1000;
        const date = log.started_at.split('T')[0]; 
        
        taskTotalTime += duration;
        taskDailyTime[date] = (taskDailyTime[date] || 0) + duration;
      });

      if (taskTotalTime === 0) return; 
      
      const timePerMember = taskTotalTime / assigneeIds.length;
      
      
      assigneeIds.forEach(assigneeId => {
        if (!memberAnalytics[assigneeId]) {
          return; 
        }
        
        memberAnalytics[assigneeId].totalTimeSpent += timePerMember;
        
        
        const member = memberAnalytics[assigneeId];
        const dailyTimeMap = new Map(member.dailyTime.map(d => [d.date, d]));
        
        Object.entries(taskDailyTime).forEach(([date, dayTime]) => {
          const dailyTimePerMember = dayTime / assigneeIds.length;
          
          if (dailyTimeMap.has(date)) {
            dailyTimeMap.get(date)!.seconds += dailyTimePerMember;
          } else {
            dailyTimeMap.set(date, { date, seconds: dailyTimePerMember });
          }
        });
        
        
        member.dailyTime = Array.from(dailyTimeMap.values());
      });
    });

    
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    
    const members = Object.values(memberAnalytics);
    members.forEach(member => {
      const dailyTimeMap = new Map(member.dailyTime.map(d => [d.date, d]));
      
      
      last7Days.forEach(date => {
        if (!dailyTimeMap.has(date)) {
          dailyTimeMap.set(date, { date, seconds: 0 });
        }
      });
      
      
      member.dailyTime = Array.from(dailyTimeMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));
    });

    
    const executionTime = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Member Time Analytics Performance: ${executionTime}ms`);
    }

    return { members };
  } catch (error) {
    console.error('Error in getMemberTimeAnalytics:', error);
    throw new Error('Failed to fetch member time analytics');
  }
}
