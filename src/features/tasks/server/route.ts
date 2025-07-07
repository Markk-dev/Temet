import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMembers } from "@/features/members/utils";

import { Task, TaskStatus } from "../types";
import { Project } from "@/features/projects/types";

import { createTaskSchema } from "../schemas";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";

import { createAdminClient } from "@/lib/appwrite";
import { SessionMiddleware } from "@/lib/session-middleware";


// TODO: will add storage per workspace later
// TODO: will add messaging feature per workspace later
// TODO: will add comment feature per workspace later

const app = new Hono()
  .delete(
    "/:taskId",
    SessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const databases = c.get("databases");
      const { taskId} = c.req.param(); 

      const task = await databases.getDocument<Task>(
        DATABASE_ID,
        TASKS_ID,
        taskId,
      );

      const member = await getMembers({
        databases,
        workspaceId: task.workspaceId,
        userId: user.$id,
      });

        if(!member){
            return c.json({error: "Unathorized"}, 401);
        }

        await databases.deleteDocument(
            DATABASE_ID,
            TASKS_ID,
            taskId,
        );

        return c.json({data: {$id: task.$id} });
    }
  )
  .get(
    "/",
    SessionMiddleware,
    zValidator(
        "query",
        z.object({
            workspaceId: z.string(),
            projectId: z.string().nullish(),
            assigneeId: z.string().nullish(),
            status: z.nativeEnum(TaskStatus).nullish(),
            search: z.string().nullish(),
            dueDate: z.string().nullish(),
        })
    ),
    async (c) => {
        const { users } = await createAdminClient();
        const databases = c.get("databases");
        const user = c.get("user");

        const {
            workspaceId,
            projectId,
            status,
            search,
            assigneeId,
            dueDate
        } = c.req.valid("query");
        
        const member = await getMembers({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if(!member) {
            return  c.json({ error: "Unathorized"}, 401);
        }

        const query = [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt")
        ];

        if(projectId){
            console.log("projectId: ", projectId);
            query.push(Query.equal("projectId", projectId));
        }

        if(status){
            console.log("status: ", status);
            query.push(Query.equal("status", status));
        }

        if(assigneeId){
            console.log("assigneeId: ", assigneeId);
            query.push(Query.contains("assigneeId", [assigneeId]));
        }

        if(dueDate){
            console.log("dueDate: ", dueDate);
            query.push(Query.equal("dueDate", dueDate));
        }

        if(search){
            console.log("search: ", search);
            query.push(Query.search("name", search));
        }

        const tasks = await databases.listDocuments<Task>(
            DATABASE_ID,
            TASKS_ID,
            query,
        );

        const projectIds = tasks.documents.map((task) => task.projectId);
        const assigneeIds = tasks.documents.flatMap((task) => task.assigneeId);

        const projects = await databases.listDocuments<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
        );

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
        );

        const assigneesList = await Promise.all(
            members.documents.map(async (member) => {
                const user = await users.get(member.userId);
                return {
                    ...member,
                    name: user.name,
                    email: user.email,
                }
            })
        );

        const populatedTasks = tasks.documents.map((task) => {
            const project = projects.documents.find(
                (project) => project.$id === task.projectId,
            );
            
            const assignees = assigneesList.filter((assignee) => task.assigneeId.includes(assignee.$id));
            
            return {
                ...task,
                project,
                assignees,
            };
        });
        
        return c.json({ 
            data: {
                ...tasks,
                documents: populatedTasks,
            }
        })
    }
  )
  .post(
    "/",
    SessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");
        const {
            name,
            status,
            workspaceId,
            projectId,
            dueDate,
            assigneeId,
        } = c.req.valid("json");

        const member = await getMembers({
            databases,
            workspaceId,
            userId: user.$id
        });

        if(!member) {
            return c.json({error: "Unauthorized"}, 401)
        }

        const highestPositionTask = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("status", status),
                Query.equal("workspaceId", workspaceId),
                Query.orderAsc("position"),
                Query.limit(1)
            ],
        );

        const newPosition = 
        highestPositionTask.documents.length > 0 
        ? highestPositionTask.documents[0].position + 1000
        : 1000;

        const task = await databases.createDocument(
            DATABASE_ID,
            TASKS_ID,
            ID.unique(),
            {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
                position: newPosition
            },
        );

        return c.json({data: task})
    }
  )
  .patch(
    "/:taskId",
    SessionMiddleware,
    zValidator("json", createTaskSchema.partial()),
    async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");
        const {
            name,
            status,
            description,
            projectId,
            dueDate,
            assigneeId,
        } = c.req.valid("json");

        const { taskId } = c.req.param();
        const existingTask = await databases.getDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId,
        );
        

        const member = await getMembers({
            databases,
            workspaceId: existingTask.workspaceId,
            userId: user.$id
        });

        if(!member) {
            return c.json({error: "Unauthorized"}, 401)
        }

        const task = await databases.updateDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId,
            {
                name,
                status,
                projectId,
                dueDate,
                assigneeId,
                description,
            },
        );

        return c.json({data: task})
    }
  )
  .get(
    "/:taskId",
    SessionMiddleware,
    async (c) => {
        const currentUser = c.get("user");
        const databases = c.get("databases");
        const { users } = await createAdminClient();
        const { taskId } = c.req.param();

        const task = await databases.getDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId,
        );

        const currentMember = await getMembers({
            databases,
            workspaceId: task.workspaceId,
            userId: currentUser.$id,
        });

        if(!currentMember) {
            return c.json({error: "Unauthorized"}, 401)
        }

        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            task.projectId,
        );

        const member = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            task.assigneeId,
        );

        const user = await users.get(member.userId);

        const assignee = {
            ...member,
            name: user.name,
            email: user.email,
        };

        return c.json({
            data: {
                ...task,
                project,
                assignee,
            }
        })
    }
  )

export default app;

