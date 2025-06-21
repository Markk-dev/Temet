import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { MemberRole } from '@/features/members/types';
import { getMembers } from '@/features/members/utils';
import { generateInviteCode, getFileViewUrl } from '@/lib/utils'; 

import { SessionMiddleware } from '@/lib/session-middleware';
import { createWorkspacesSchema, updateWorkspacesSchema } from '../schemas';

import { DATABASE_ID, WORKSPACES_ID, IMAGES_BUCKET_ID, PROJECT_ENDPOINT, APPWRITE_PROJECT, MEMBERS_ID } from '@/config';

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
    )
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

      //TODO: DELETE MEMBERS, PROJECTS, TASK

      await databases.deleteDocument(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
      );

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

      return c.json({data : workspace})
    }
  );
    
export default app;
