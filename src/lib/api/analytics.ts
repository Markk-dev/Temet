import { client } from "@/lib/rpc";

interface MemberDailyTime {
  date: string;
  seconds: number;
}

export interface MemberAnalytics {
  id: string;
  name: string;
  email: string;
  totalTimeSpent: number;
  dailyTime: MemberDailyTime[];
}

export interface MemberTimeAnalyticsResponse {
  members: MemberAnalytics[];
}

export async function getMemberTimeAnalytics(
  params: { workspaceId: string }
): Promise<MemberTimeAnalyticsResponse> {
  const response = await client.api.analytics["member-time"]["$get"]({
    query: { workspaceId: params.workspaceId },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch member time analytics');
  }

  const result = await response.json();
  return result.data;
}
