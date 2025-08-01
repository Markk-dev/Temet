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
import { pusher } from "@/lib/pusher";

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


        const { users } = await createAdminClient();
        const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
        );
        const assignees = await Promise.all(
            members.documents.map(async (member) => {
                const user = await users.get(member.userId);
                return {
                    ...member,
                    name: user.name || user.email,
                    email: user.email,
                };
            })
        );
        let project = null;
        if (task.projectId) {
            try {
                project = await databases.getDocument(
                    DATABASE_ID,
                    PROJECTS_ID,
                    task.projectId
                );
            } catch {}
        }

        await databases.deleteDocument(
            DATABASE_ID,
            TASKS_ID,
            taskId,
        );

        await pusher.trigger("tasks", "task-deleted", { taskId, task: { ...task, assignees, project } });

        return c.json({data: { $id: task.$id} });
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
                    name: user.name || user.email,
                    email: user.email,
                }
            })
        );

        const populatedTasks = tasks.documents.map((task) => {
            const project = projects.documents.find(
                (project) => project.$id === task.projectId,
            );
            
            const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];

            const assignees = assigneesList.filter((assignee) => assigneeIds.includes(assignee.$id));
            
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

        
        let initialTimeLogs = "[]";
        if (status === TaskStatus.IN_PROGRESS) {
            const timeLog = {
                id: crypto.randomUUID(),
                started_at: new Date().toISOString(),
                
            };
            initialTimeLogs = JSON.stringify([timeLog]);
        }

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
                position: newPosition,
                totalTimeSpent: 0,
                timeLogs: initialTimeLogs,
                lastActiveAt: new Date().toISOString()
            },
        );

        
        const { users } = await createAdminClient();
        const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
        );
        const assignees = await Promise.all(
            members.documents.map(async (member) => {
                const user = await users.get(member.userId);
                return {
                    ...member,
                    name: user.name || user.email,
                    email: user.email,
                };
            })
        );
        let project = null;
        if (task.projectId) {
            try {
                project = await databases.getDocument(
                    DATABASE_ID,
                    PROJECTS_ID,
                    task.projectId
                );
            } catch {}
        }
        await pusher.trigger("tasks", "task-created", { task: { ...task, assignees, project } });

        return c.json({data: { ...task, assignees, project }})
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

        
        let updatedTimeLogs: any[] = [];
        try {
            const timeLogsString = existingTask.timeLogs as string;
            updatedTimeLogs = timeLogsString ? JSON.parse(timeLogsString) : [];
        } catch {
            updatedTimeLogs = [];
        }

        const oldStatus = existingTask.status;
        const newStatus = status;
        const currentTime = new Date().toISOString();

        // Handle time logging when status changes
        if (newStatus && newStatus !== oldStatus) {
            
            if (newStatus === TaskStatus.IN_PROGRESS) {
                
                const openLogIndex = updatedTimeLogs.findIndex((log: any) => !log.ended_at);
                if (openLogIndex >= 0) {
                    updatedTimeLogs[openLogIndex].ended_at = currentTime;
                }
                
                
                updatedTimeLogs.push({
                    id: crypto.randomUUID(),
                    started_at: currentTime,
                    
                });
            }
            
            
            else if (oldStatus === TaskStatus.IN_PROGRESS) {
                const openLogIndex = updatedTimeLogs.findIndex((log: any) => !log.ended_at);
                if (openLogIndex >= 0) {
                    updatedTimeLogs[openLogIndex].ended_at = currentTime;
                }
            }
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
                timeLogs: JSON.stringify(updatedTimeLogs), 
            },
        );

        
        const { users } = await createAdminClient();
        const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
        );
        const assignees = await Promise.all(
            members.documents.map(async (member) => {
                const user = await users.get(member.userId);
                return {
                    ...member,
                    name: user.name || user.email,
                    email: user.email,
                };
            })
        );
        let project = null;
        if (task.projectId) {
            try {
                project = await databases.getDocument(
                    DATABASE_ID,
                    PROJECTS_ID,
                    task.projectId
                );
            } catch {}
        }
        await pusher.trigger("tasks", "task-updated", { task: { ...task, assignees, project } });

        return c.json({data: { ...task, assignees, project }})
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

        try {
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

            const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.contains("$id", assigneeIds)]
            );

            const assignee = await Promise.all(
                members.documents.map(async (member) => {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name || user.email,
                        email: user.email,
                    };
                })
            );


            const assigneeResult = assigneeIds.length === 1 ? assignee[0] : assignee;

            return c.json({
                data: {
                    ...task,
                    project,
                    assignee: assigneeResult,
                }
            })
        } catch (err: any) {
            if (err.code === 404) {
                return c.json({ error: "Task not found" }, 404);
            }
            throw err; 
        }
    }
  )
  .post(
    "/bulk-update",
    SessionMiddleware,
    zValidator(
        "json",
        z.object({
          tasks: z.array(
            z.object({
                $id: z.string(),
                status: z.nativeEnum(TaskStatus),
                position: z.number().int().positive().min(1000).max(1_000_000)
            })
          )
        })
    ),
    async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const {tasks} = await c.req.valid("json");

        const tasksToUpdate = await databases.listDocuments<Task>(
            DATABASE_ID,
            TASKS_ID,
            [Query.contains("$id", tasks.map((task) => task.$id))]
        );

        const worksapceIds = new Set(tasksToUpdate.documents.map(task => task.workspaceId));
        if(worksapceIds.size !== 1){
            return c.json({ error: "Tasks must be in the same workspace"}, 400);
        }

        const workspaceId = worksapceIds.values().next().value;

        if (!workspaceId) {
            return c.json({ error: "Missing workspaceId" }, 400);
          }

        const member = await getMembers({
            databases,
            workspaceId: workspaceId!,
            userId: user.$id,
        });

        if(!member){
            return c.json({error: "Unauthorized"}, 401);
        };

        const updatedTasks = await Promise.all(
            tasks.map(async (taskUpdate) => {
                const { $id, status, position } = taskUpdate;
                
                
                const existingTask = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, $id);
                
                
                let updatedTimeLogs: any[] = [];
                try {
                    const timeLogsString = existingTask.timeLogs as string;
                    updatedTimeLogs = timeLogsString ? JSON.parse(timeLogsString) : [];
                } catch {
                    updatedTimeLogs = [];
                }

                const currentTime = new Date().toISOString();
                const oldStatus = existingTask.status;
                const newStatus = status;

                
                if (newStatus && newStatus !== oldStatus) {
                    
                    if (newStatus === TaskStatus.IN_PROGRESS) {
                        
                        const openLogIndex = updatedTimeLogs.findIndex((log: any) => !log.ended_at);
                        if (openLogIndex >= 0) {
                            updatedTimeLogs[openLogIndex].ended_at = currentTime;
                        }
                        
                        
                        updatedTimeLogs.push({
                            id: crypto.randomUUID(),
                            started_at: currentTime,
                            
                        });
                    }
                    
                    
                    else if (oldStatus === TaskStatus.IN_PROGRESS) {
                        const openLogIndex = updatedTimeLogs.findIndex((log: any) => !log.ended_at);
                        if (openLogIndex >= 0) {
                            updatedTimeLogs[openLogIndex].ended_at = currentTime;
                        }
                    }
                }

                return databases.updateDocument(
                    DATABASE_ID,
                    TASKS_ID,
                    $id,
                    { 
                        status, 
                        position,
                        timeLogs: JSON.stringify(updatedTimeLogs) 
                    } 
                );
            })
        );
        

        const { users } = await createAdminClient();
        const allProjectIds = Array.from(new Set(updatedTasks.map(task => task.projectId)));
        const projectsList = allProjectIds.length > 0 ? await databases.listDocuments(
            DATABASE_ID,
            PROJECTS_ID,
            [Query.contains("$id", allProjectIds)]
        ) : { documents: [] };
        const assigneeIds = updatedTasks.flatMap(task => Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId]);
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
                    name: user.name || user.email,
                    email: user.email,
                };
            })
        );
        const populatedTasks = updatedTasks.map((task) => {
            const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
            const assignees = assigneesList.filter((assignee) => assigneeIds.includes(assignee.$id));
            const project = projectsList.documents.find((p) => p.$id === task.projectId) || null;
            return {
                ...task,
                assignees,
                project,
            };
        });

        await pusher.trigger("tasks", "tasks-bulk-updated", { tasks: populatedTasks });

        return c.json({ data: updatedTasks });
    }
  )

export default app;

