import { Hono } from 'hono';
import { SessionMiddleware } from '@/lib/session-middleware';
import { getMemberTimeAnalytics } from '@/lib/services/analytics';
import { getMembers } from '@/features/members/utils';

const app = new Hono()
  .get(
    "/member-time",
    SessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const workspaceId = c.req.query("workspaceId");

      if (!workspaceId) {
        return c.json({ error: "Workspace ID is required" }, 400);
      }

      // Check if user is a member of the workspace
      const member = await getMembers({
        databases,
        workspaceId,
        userId: user.$id
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const analytics = await getMemberTimeAnalytics({ workspaceId });
        return c.json({ data: analytics });
      } catch (error) {
        console.error('Error fetching member time analytics:', error);
        return c.json({ error: "Failed to fetch analytics" }, 500);
      }
    }
  );

export default app; 