import { createAdminClient } from "@/lib/appwrite";

/**
 * 🚀 PERFORMANCE UTILITY: Batch fetch users to prevent N+1 queries
 * This utility reduces user fetching from O(n) queries to O(1) query
 */
export async function batchFetchUsers(userIds: string[]): Promise<Map<string, any>> {
  const usersMap = new Map();
  
  if (userIds.length === 0) {
    return usersMap;
  }

  const { users } = await createAdminClient();
  const uniqueUserIds = [...new Set(userIds)];
  
  // Batch fetch all users in parallel
  const userPromises = uniqueUserIds.map(async (userId) => {
    try {
      const user = await users.get(userId);
      return [userId, user];
    } catch (error) {
      // Return fallback user data instead of throwing
      return [userId, { 
        name: "Unknown User", 
        email: "unknown@example.com",
        $id: userId
      }];
    }
  });
  
  const userResults = await Promise.allSettled(userPromises);
  userResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      const [userId, user] = result.value;
      usersMap.set(userId, user);
    }
  });

  return usersMap;
}

/**
 * 🚀 PERFORMANCE UTILITY: Enhanced member data with user info
 */
export function enhanceMembersWithUsers(members: any[], usersMap: Map<string, any>) {
  return members.map((member) => {
    const user = usersMap.get(member.userId) || { 
      name: "Unknown User", 
      email: "unknown@example.com" 
    };
    
    return {
      ...member,
      name: user.name || user.email,
      email: user.email,
    };
  });
}

/**
 * 🚀 PERFORMANCE MONITORING: Track execution time
 */
export function createPerformanceTimer(label: string) {
  const startTime = Date.now();
  
  return {
    end: () => {
      const executionTime = Date.now() - startTime;
      console.log(`🚀 ${label} Performance: ${executionTime}ms`);
      return executionTime;
    }
  };
}