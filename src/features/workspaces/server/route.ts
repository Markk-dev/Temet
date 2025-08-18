import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { MemberRole } from '@/features/members/types';
import { getMembers } from '@/features/members/utils';
import { generateInviteCode, getFileViewUrl, extractFileIdFromUrl } from '@/lib/utils'; 

import { Workspace } from '../types';
import { SessionMiddleware } from '@/lib/session-middleware';
import { createWorkspacesSchema, updateWorkspacesSchema } from '../schemas';

import { endOfMonth, startOfMonth, subMonths } from"date-fns";
import { createAdminClient } from '@/lib/appwrite';

import { pusherServer } from "@/lib/pusher";

import { DATABASE_ID, WORKSPACES_ID, IMAGES_BUCKET_ID, PROJECT_ENDPOINT, APPWRITE_PROJECT, MEMBERS_ID, TASKS_ID } from '@/config';
import { TaskStatus } from '@/features/tasks/types';

const app = new Hono()
  .get("/", SessionMiddleware, async (c) => {
    
      const user = c.get('user');
      const databases = c.get('databases');
      
      //To check all members a user is a part of
      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal('userId', user.$id)]
      );

      if(members.total === 0 ) {
        return c.json ({data: { documents: [], total: 0}})
      }

      const workspaceIds = members.documents.map((member) => member.workspaceId);

      const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
        [
          Query.orderDesc("$createdAt"),
          Query.contains("$id", workspaceIds)
        ],
      );

      return c.json({ data: workspaces });
  })
  .get(
    "/:workspaceId",
    SessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();
      
      const member = await getMembers({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if(!member) {
        return c.json({error: "Unauthorized"}, 401);
    
      };

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ data: workspace });
    }
  )
  .get(
    "/:workspaceId/info",
    SessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const { workspaceId } = c.req.param();
      
      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ 
        data: {
          $id: workspace.$id, 
          name: workspace.name, 
          imageUrl: workspace.imageUrl} });
    }
  )
  .post(
    '/',
    zValidator("form", createWorkspacesSchema),
    SessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");

      const { name, image } = c.req.valid("form");

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );

        if (!PROJECT_ENDPOINT || !APPWRITE_PROJECT) {
          console.error("Missing APPWRITE_ENDPOINT or APPWRITE_PROJECT_ID in env");
          return c.text("Server misconfiguration", 500);
        }

        //Will fix later but for now HARDCODED KA MUNA
        uploadedImageUrl = getFileViewUrl(file.$id);
      }

    const workspace = await databases.createDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      ID.unique(),
      {
        name,
        userId: user.$id,
        imageUrl: uploadedImageUrl,
        inviteCode: generateInviteCode(6),
      }
    );

    await databases.createDocument(
      DATABASE_ID,
      MEMBERS_ID,
      ID.unique(),
      {
        userId: user.$id,
        workspaceId: workspace.$id,
        role: MemberRole.ADMIN,
      }
    );
    // await pusherServer.trigger("workspaces", "workspace-created", { workspace });
    return c.json({ data: workspace });
  }
)
  .patch(
    "/:workspaceId",
    SessionMiddleware,
    zValidator("form", updateWorkspacesSchema),
    async (c) => {
      const databases = c.get("databases");
      const storage = c.get("storage");
      const user = c.get("user");
      
      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid("form");


      const member = await getMembers({
        databases, 
        workspaceId,
        userId: user.$id,
      });

      if(!member || member.role !==MemberRole.ADMIN){
          return c.json({error: "Unauthorized"}, 401);
      }

      let uploadedImageUrl: string | undefined;

      if (image instanceof File) {
        const file = await storage.createFile(
          IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );

        if (!PROJECT_ENDPOINT || !APPWRITE_PROJECT) {
          console.error("Missing APPWRITE_ENDPOINT or APPWRITE_PROJECT_ID in env");
          return c.text("Server misconfiguration", 500);
        }

        //Will fix later but for now HARDCODED KA MUNA
        uploadedImageUrl = getFileViewUrl(file.$id);
      } else {
        uploadedImageUrl = image;
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl,
        
        }
      );
      // await pusherServer.trigger("workspaces", "workspace-updated", { workspace });
      return c.json({ data: workspace });
    }
  )
  .delete(
    "/:workspaceId",
    SessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      
      const { workspaceId } = c.req.param();

      const member = await getMembers({
        databases, 
        workspaceId,
        userId: user.$id,
      });

      if(!member || member.role !==MemberRole.ADMIN){
          return c.json({error: "Unauthorized"}, 401);
      }

      // Get the workspace to check for imageUrl
      const workspace = await databases.getDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

      // Delete the image from storage if it exists
      if (workspace.imageUrl) {
          const fileId = extractFileIdFromUrl(workspace.imageUrl);
        if (fileId) {
          const { storage } = await createAdminClient();
          try {
            await storage.deleteFile(IMAGES_BUCKET_ID, fileId);
          } catch {
           
          }
        }
      }

      //TODO: DELETE MEMBERS, PROJECTS, TASK

      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );
      // await pusherServer.trigger("workspaces", "workspace-deleted", { workspaceId });

      return c.json({data : { $id: workspaceId} })
    }
  )
  .post(
    "/:workspaceId/reset-invite-code",
    SessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      
      const { workspaceId } = c.req.param();

      const member = await getMembers({
        databases, 
        workspaceId,
        userId: user.$id,
      });

      if(!member || member.role !==MemberRole.ADMIN){
          return c.json({error: "Unauthorized"}, 401);
      }

      const workspace = await databases.updateDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
        {
          inviteCode: generateInviteCode(6),
        }
      );
      // await pusherServer.trigger("workspaces", "workspace-invite-reset", { workspace });

      return c.json({data : workspace})
    }
  )
  .post(
    "/:workspaceId/join",
    SessionMiddleware,
    zValidator("json", z.object({code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid("json");
      
      const databases = c.get("databases");
      const user = c.get("user");

      const member = await getMembers({
        databases, 
        workspaceId,
        userId: user.$id,
      });

      if(member){
        return c.json({"error": "Already a member"}, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,

      );

      if(workspace.inviteCode !== code){
        return c.json({"error": "Invalid invite code"}, 400);
      }

      await databases.createDocument(
        DATABASE_ID,
        MEMBERS_ID,
        ID.unique(),
        {
          workspaceId,
          userId: user.$id,
          role: MemberRole.MEMBER,
        },
      );
      // await pusherServer.trigger("workspaces", "workspace-joined", { workspaceId, userId: user.$id });

      return c.json({ data: workspace });
    }
  )
  .get(
    "/:workspaceId/analytics",
    SessionMiddleware,
    async (c) => {
      const databases = c.get("databases");
      const user = c.get("user");
      const { workspaceId } = c.req.param();

      const member = await getMembers({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if(!member){
        return c.json({error: "Unauthorized"}, 401);
      }

      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const thisMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        
        ]
      );

      const lastMonthTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
        
        ]
      );

      const taskCount = thisMonthTasks.total;
      const taskDifference = taskCount - lastMonthTasks.total;

      const thisMonthAssignedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("assigneeId", member.$id),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        
        ]
      );

      const lastMonthAssignedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("assigneeId", member.$id),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),

        ]
      );

      const assignedTaskCount = thisMonthAssignedTasks.total;
      const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;

      const thisMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        
        ]
      );

      const lastMonthCompletedTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.equal("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),

        ]
      );

      const completedTaskCount = thisMonthCompletedTasks.total;
      const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;

      const thisMonthOverdueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        
        ]
      );

      const lastMonthOverdueTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.lessThan("dueDate", now.toISOString()),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),

        ]
      );

      const overdueTaskCount = thisMonthOverdueTasks.total;
      const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;

      const thisMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
        
        ]
      );

      const lastMonthIncompleteTasks = await databases.listDocuments(
        DATABASE_ID,
        TASKS_ID,
        [
          Query.equal("workspaceId", workspaceId),
          Query.notEqual("status", TaskStatus.DONE),
          Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
          Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),

        ]
      );

      const incompleteTaskCount = thisMonthIncompleteTasks.total;
      const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;

      return c.json({
        data:{
          taskCount,
          taskDifference,
          assignedTaskCount,
          assignedTaskDifference,
          completedTaskCount,
          completedTaskDifference,
          incompleteTaskCount,
          incompleteTaskDifference,
          overdueTaskCount,
          overdueTaskDifference,
        },
      })
    }
  )
    
export default app;
