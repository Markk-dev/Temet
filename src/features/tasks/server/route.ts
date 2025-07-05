import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMembers } from "@/features/members/utils";

import { TaskStatus } from "../types";
import { Project } from "@/features/projects/types";

import { createTaskSchema } from "../schemas";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";

import { createAdminClient } from "@/lib/appwrite";
import { SessionMiddleware } from "@/lib/session-middleware";


// TODO: will add storage per workspace later
// TODO: will add messaging feature per workspace later
// TODO: will add comment feature per workspace later

const app = new Hono()
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

        const tasks = await databases.listDocuments(
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

export default app;

