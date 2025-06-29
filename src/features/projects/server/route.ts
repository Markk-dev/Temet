import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';

import { zValidator } from '@hono/zod-validator';
import { SessionMiddleware } from '@/lib/session-middleware';
import { getMembers } from '@/features/members/utils';
import { APPWRITE_PROJECT, DATABASE_ID, IMAGES_BUCKET_ID, PROJECT_ENDPOINT, PROJECTS_ID } from '@/config';
import { createProjectSchema, updateProjectSchema } from '../schema';
import { getFileViewUrl } from '@/lib/utils';
import { Project } from '../types';


const app = new  Hono()
    .post(
        "/",
        SessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");
      
            const { name, image, workspaceId } = c.req.valid("form");

            const member = await getMembers({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if(!member){
                return c.json({ error: "Unauthorized" }, 401)
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
            }
      
          const project = await databases.createDocument(
            DATABASE_ID,
            PROJECTS_ID,
            ID.unique(),
            {
              name,
              imageUrl: uploadedImageUrl,
              workspaceId
            }
          );

          return c.json({ data: project });
        }
    )
    .get(
        "/",
        SessionMiddleware,
        zValidator("query", z.object({workspaceId: z.string() })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            
            const { workspaceId } = c.req.valid("query");

            if(!workspaceId) {
                return c.json({ error: "Missing workspaceId" }, 400)
            };

            const member = await getMembers({
                databases,
                workspaceId,
                userId: user.$id,
            });
            if(!member){
                return c.json({ error: "Unauthorized" }, 401)
            }

            const projects = await databases.listDocuments(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("$createdAt"),
                ],
            );

            return c.json({data: projects});
        }
    )
    .patch(
      "/:projectId",
      SessionMiddleware,
      zValidator("form", updateProjectSchema),
      async (c) => {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");
        
        const { projectId } = c.req.param();
        const { name, image } = c.req.valid("form");
  
        const existingProject = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
        );
  
        const member = await getMembers({
          databases, 
          workspaceId: existingProject.workspaceId,
          userId: user.$id,
        });
  
        if(!member){
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
  
        const project = await databases.updateDocument(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
          {
            name,
            imageUrl: uploadedImageUrl,
          
          }
        );
        return c.json({ data: project });
      }
    )

export default app;