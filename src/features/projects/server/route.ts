import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';

import { zValidator } from '@hono/zod-validator';
import { SessionMiddleware } from '@/lib/session-middleware';
import { getMembers } from '@/features/members/utils';
import { APPWRITE_PROJECT, DATABASE_ID, IMAGES_BUCKET_ID, PROJECT_ENDPOINT, PROJECTS_ID, TASKS_ID } from '@/config';
import { createProjectSchema, updateProjectSchema } from '../schema';
import { getFileViewUrl, extractFileIdFromUrl } from '@/lib/utils';
import { Project } from '../types';
import { createAdminClient } from '@/lib/appwrite';

import { pusher } from "@/lib/pusher";
import { endOfMonth, startOfMonth, subMonths } from"date-fns";
import { TaskStatus } from '@/features/tasks/types';



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

          await pusher.trigger("projects", "project-created", { project });
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

            const projects = await databases.listDocuments<Project>(
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
    .get(
      "/:projectId",
      SessionMiddleware,
      async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");
        const  { projectId } = c.req.param();
  
        const project = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
        );

        const member = await getMembers({
          databases,
          workspaceId: project.workspaceId,
          userId: user.$id,
        });

        if(!member){
          return c.json({ error: "Unauthorized" }, 401)
        }

        return c.json({data: project})
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
        await pusher.trigger("projects", "project-updated", { project });
        return c.json({ data: project });
      }
    )
    .delete(
      "/:projectId",
      SessionMiddleware,
      async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        
        const { projectId } = c.req.param();
  
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

        // Check for tasks in this project
        const tasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId)
          ]
        );

        // If there are tasks, check if all are DONE
        if (tasks.total > 0) {
          const notDone = tasks.documents.find(task => task.status !== "DONE");
          if (notDone) {
            return c.json({ error: "Cannot delete project: All tasks must be DONE or project must be empty." }, 400);
          }
        }

        // CASCADE DELETE KAHIT BAWAL HAHA
        // to make sure walang mag eeror if ever ma bypass
        for (const task of tasks.documents) {
          await databases.deleteDocument(
            DATABASE_ID,
            TASKS_ID,
            task.$id
          );
        }
  
        // Delete the image from storage if it exists
        if (existingProject.imageUrl) {
          const fileId = extractFileIdFromUrl(existingProject.imageUrl);
          if (fileId) {
            const { storage } = await createAdminClient();
            try {
              await storage.deleteFile(IMAGES_BUCKET_ID, fileId);
            } catch (e) {
              console.error('Failed to delete project image from storage:', e);
            }
          }
        }

        //TODO: DELETE TASK
  
        await databases.deleteDocument(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
        );
        await pusher.trigger("projects", "project-deleted", { projectId });
  
        return c.json({data : { $id: existingProject.$id} })
      }
    )
    //Newly Added
    .get(
      "/:projectId/analytics",
      SessionMiddleware,
      async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const { projectId } = c.req.param();

        const project = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId
        );

        const member = await getMembers({
          databases,
          workspaceId: project.workspaceId,
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

        // Count ALL tasks in the project (not just this month)
        const allTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
          ]
        );

        // Count tasks created this month vs last month for difference calculation
        const thisMonthTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          ]
        );

        const lastMonthTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
          ]
        );

        const taskCount = allTasks.total;
        const taskDifference = thisMonthTasks.total - lastMonthTasks.total;

        // Count ALL tasks assigned to current user (not just this month)
        const allAssignedTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.contains("assigneeId", member.$id),
          ]
        );

        // Count assigned tasks created this month vs last month for difference
        const thisMonthAssignedTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.contains("assigneeId", member.$id),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          ]
        );

        const lastMonthAssignedTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.contains("assigneeId", member.$id),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
          ]
        );

        const assignedTaskCount = allAssignedTasks.total;
        const assignedTaskDifference = thisMonthAssignedTasks.total - lastMonthAssignedTasks.total;

        // Count ALL completed tasks in project (not just this month)
        const allCompletedTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.equal("status", TaskStatus.DONE),
          ]
        );

        // Count completed tasks created this month vs last month for difference
        const thisMonthCompletedTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.equal("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          ]
        );

        const lastMonthCompletedTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.equal("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
  
          ]
        );

        const completedTaskCount = allCompletedTasks.total;
        const completedTaskDifference = thisMonthCompletedTasks.total - lastMonthCompletedTasks.total;

        // Count ALL overdue tasks in project (not just this month)
        const allOverdueTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.notEqual("status", TaskStatus.DONE),
            Query.lessThan("dueDate", now.toISOString()),
          ]
        );

        // Count overdue tasks created this month vs last month for difference
        const thisMonthOverdueTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
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
            Query.equal("projectId", projectId),
            Query.notEqual("status", TaskStatus.DONE),
            Query.lessThan("dueDate", now.toISOString()),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
          ]
        );

        const overdueTaskCount = allOverdueTasks.total;
        const overdueTaskDifference = thisMonthOverdueTasks.total - lastMonthOverdueTasks.total;

        // Count ALL incomplete tasks in project (not just this month)
        const allIncompleteTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.notEqual("status", TaskStatus.DONE),
          ]
        );

        // Count incomplete tasks created this month vs last month for difference
        const thisMonthIncompleteTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.notEqual("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
          ]
        );

        const lastMonthIncompleteTasks = await databases.listDocuments(
          DATABASE_ID,
          TASKS_ID,
          [
            Query.equal("projectId", projectId),
            Query.notEqual("status", TaskStatus.DONE),
            Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
            Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
  
          ]
        );

        const incompleteTaskCount = allIncompleteTasks.total;
        const incompleteTaskDifference = thisMonthIncompleteTasks.total - lastMonthIncompleteTasks.total;

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