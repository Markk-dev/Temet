import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, TASKS_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";
import { TimeLog, TaskStatus } from "@/features/tasks/types";

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
    // 🚀 PERFORMANCE OPTIMIZED: Parallel queries and batch user fetching
    const startTime = Date.now();
    const { databases } = await createSessionClient();
    const { users } = await createAdminClient();

    // 🚀 OPTIMIZATION: Fetch members and tasks in parallel
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
          Query.limit(1000) // Increase limit for better performance
        ]
      )
    ]);

    const memberAnalytics: Record<string, MemberAnalytics> = {};
    
    // 🚀 OPTIMIZATION: Batch fetch all users in one go (prevents N+1 queries)
    const uniqueUserIds = [...new Set(membersResult.documents.map(member => member.userId))];
    const usersMap = new Map();
    
    if (uniqueUserIds.length > 0) {
      // Batch fetch all users in parallel with better error handling
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

    // ✅ FIXED: Initialize member analytics using pre-fetched user data
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
        console.log(`📊 Task ${task.$id}: Found ${timeLogs.length} time logs`);
      } catch (error) {
        console.error(`❌ Failed to parse time logs for task ${task.$id}:`, error);
        console.log(`Raw timeLogs data:`, task.timeLogs);
        return; 
      }

      
      const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
      
      
      let taskTotalTime = 0;
      const taskDailyTime: Record<string, number> = {}; 

      timeLogs.forEach((log: TimeLog) => {
        if (!log.started_at) {
          console.log(`⚠️ Time log missing started_at:`, log);
          return; 
        }

        
        const endTime = log.ended_at || new Date().toISOString();
        const duration = (new Date(endTime).getTime() - new Date(log.started_at).getTime()) / 1000;
        const date = log.started_at.split('T')[0]; 
        
        console.log(`📅 Time log: ${date} - ${duration} seconds (${duration/60} minutes)`);
        
        taskTotalTime += duration;
        taskDailyTime[date] = (taskDailyTime[date] || 0) + duration;
      });

      
      const timePerMember = taskTotalTime / assigneeIds.length;
      
      assigneeIds.forEach(assigneeId => {
        if (!memberAnalytics[assigneeId]) {
          console.log(`⚠️ Member ${assigneeId} not found in analytics`);
          return; 
        }
        
        console.log(`👤 Adding ${timePerMember} seconds to member ${assigneeId}`);
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

    // Performance monitoring
    const executionTime = Date.now() - startTime;
    console.log(`🚀 Member Time Analytics Performance: ${executionTime}ms`);
    
    // Debug final results
    console.log(`📊 Final Analytics Results:`);
    Object.values(memberAnalytics).forEach(member => {
      console.log(`👤 ${member.name}: ${member.totalTimeSpent} seconds total, ${member.dailyTime.length} daily entries`);
    });

    return {
      members: Object.values(memberAnalytics)
    };
  } catch (error) {
    console.error('Error in getMemberTimeAnalytics:', error);
    throw new Error('Failed to fetch member time analytics');
  }
}
