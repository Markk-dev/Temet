import { Hono } from 'hono';
import { ID, Query,  } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';
import { getFileViewUrl } from '@/lib/utils'; 

import { MemberRole } from '@/features/members/types';

import { DATABASE_ID, WORKSPACES_ID, IMAGES_BUCKET_ID, PROJECT_ENDPOINT, APPWRITE_PROJECT, MEMBERS_ID } from '@/config';
import { SessionMiddleware } from '@/lib/session-middleware';
import { createWorkspacesSchema } from '../schemas';

const app = new Hono()
  .get("/", SessionMiddleware, async (c) => {
    
      const user = c.get('user');
      const databases = c.get('databases');
      
      //To check all members 
      const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal('userId', user.$id)]
      );

      const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
      );

      return c.json({ data: workspaces });
  })
  .post(
  '/',
  zValidator('form', createWorkspacesSchema),
  SessionMiddleware,
  async (c) => {
    const databases = c.get('databases');
    const storage = c.get('storage');
    const user = c.get('user');
    const { name, image } = c.req.valid('form');

    let uploadedImageUrl: string | undefined;

    if (image instanceof File) {
      const file = await storage.createFile(IMAGES_BUCKET_ID, ID.unique(), image);

      const endpoint = PROJECT_ENDPOINT;
      const projectId = APPWRITE_PROJECT;

      if (!endpoint || !projectId) {
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
    return c.json(workspace);
  }
);

export default app;
