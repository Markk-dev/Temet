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
import { pusherServer } from "@/lib/pusher";

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
        
        
        const uniqueUserIds = [...new Set(members.documents.map(member => member.userId))];
        const usersMap = new Map();
        
        if (uniqueUserIds.length > 0) {
          
          const userPromises = uniqueUserIds.map(async (userId) => {
            try {
              const user = await users.get(userId);
              return [userId, user];
            } catch (error) {
              return [userId, { name: "Unknown User", email: "unknown@example.com" }];
            }
          });
          
          const userResults = await Promise.allSettled(userPromises);
          userResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              const [userId, user] = result.value;
              usersMap.set(userId, user);
            }
          });
        }

        
        const assignees = members.documents.map((member) => {
          const user = usersMap.get(member.userId) || { 
            name: "Unknown User", 
            email: "unknown@example.com" 
          };
          
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        });
        
        let project = null;
        if (task.projectId) {
            try {
                project = await databases.getDocument<Project>(
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

        await pusherServer.trigger("tasks", "task-deleted", { taskId, task: { ...task, assignees, project } });

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
            page: z.string().transform(val => parseInt(val) || 1).optional(),
            limit: z.string().transform(val => Math.min(parseInt(val) || 50, 100)).optional(),
        })
    ),
    async (c) => {
        // 🚀 PERFORMANCE MONITORING: Track tasks route execution time
        const startTime = Date.now();
        const { users } = await createAdminClient();
        const databases = c.get("databases");
        const user = c.get("user");

        const {
            workspaceId,
            projectId,
            status,
            search,
            assigneeId,
            dueDate,
            page = 1,
            limit = 50
        } = c.req.valid("query");
        
        // 1. Check authorization first
        const member = await getMembers({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if(!member) {
            return  c.json({ error: "Unauthorized"}, 401);
        }

        // 2. Build optimized query with pagination
        const query = [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt"),
            Query.limit(limit),
            Query.offset((page - 1) * limit)
        ];

        if(projectId){
            query.push(Query.equal("projectId", projectId));
        }

        if(status){
            query.push(Query.equal("status", status));
        }

        if(assigneeId){
            query.push(Query.contains("assigneeId", [assigneeId]));
        }

        if(dueDate){
            query.push(Query.equal("dueDate", dueDate));
        }

        if(search){
            query.push(Query.search("name", search));
        }

        // 3. Fetch tasks with optimized query
        const tasks = await databases.listDocuments<Task>(
            DATABASE_ID,
            TASKS_ID,
            query,
        );

        // 4. Early return if no tasks
        if (tasks.documents.length === 0) {
            return c.json({ 
                data: {
                    documents: [],
                    total: 0,
                    page,
                    limit,
                    totalPages: 0
                }
            });
        }

        // 5. Extract unique IDs for batch fetching
        const projectIds = [...new Set(tasks.documents.map(task => task.projectId).filter(Boolean))];
        const assigneeIds = [...new Set(tasks.documents.flatMap(task => 
            Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId]
        ).filter(Boolean))];

        // 6. Batch fetch related data in parallel
        const [projects, members] = await Promise.all([
            // Fetch projects if needed
            projectIds.length > 0 
                ? databases.listDocuments<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    [Query.contains("$id", projectIds)]
                )
                : Promise.resolve({ documents: [] }),
            
            // Fetch members if needed
            assigneeIds.length > 0
                ? databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.contains("$id", assigneeIds)]
                )
                : Promise.resolve({ documents: [] })
        ]);

        // 7. Batch fetch users efficiently
        const uniqueUserIds = [...new Set(members.documents.map(member => member.userId))];
        const usersMap = new Map();
        
        if (uniqueUserIds.length > 0) {
            // Use Promise.allSettled for better error handling
            const userPromises = uniqueUserIds.map(async (userId) => {
                try {
                    const user = await users.get(userId);
                    return [userId, user];
                } catch (error) {
                    // Return fallback user data instead of throwing
                    return [userId, { 
                        name: "Unknown User", 
                        email: "unknown@example.com" 
                    }];
                }
            });
            
            const userResults = await Promise.allSettled(userPromises);
            userResults.forEach((result) => {
                if (result.status === 'fulfilled') {
                    const [userId, user] = result.value;
                    usersMap.set(userId, user);
                }
            });
        }

        // 8. Create lookup maps for O(1) access
        const projectsMap = new Map(
            projects.documents.map(project => [project.$id, project])
        );
        
        const membersMap = new Map(
            members.documents.map(member => [member.$id, member])
        );

        // 9. Populate tasks efficiently with O(n) complexity
        const populatedTasks = tasks.documents.map((task) => {
            const project = task.projectId ? projectsMap.get(task.projectId) || null : null;
            
            const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
            const assignees = assigneeIds
                .filter(id => id && membersMap.has(id))
                .map(id => {
                    const member = membersMap.get(id);
                    const user = usersMap.get(member?.userId) || { 
                        name: "Unknown User", 
                        email: "unknown@example.com" 
                    };
                    
                    return {
                        ...member,
                        name: user.name || user.email,
                        email: user.email,
                    };
                });
            
            return {
                ...task,
                project,
                assignees,
            };
        });
        
        // 10. Performance monitoring and return optimized response
        const executionTime = Date.now() - startTime;
        console.log(`🚀 Tasks Route Performance: ${executionTime}ms`);
        
        return c.json({ 
            data: {
                ...tasks,
                documents: populatedTasks,
                page,
                limit,
                totalPages: Math.ceil(tasks.total / limit)
            }
        })
    }
  )
  .get(
    "/:taskId",
    SessionMiddleware,
    async (c) => {
      // 🚀 PERFORMANCE OPTIMIZED: Uses parallel batch queries instead of sequential
      const startTime = Date.now();
      const { taskId } = c.req.param();
      const databases = c.get("databases");
      const user = c.get("user");

      // 1. Get task and check authorization in parallel
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

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // 2. Early return if no assignees to avoid unnecessary queries
      if (!task.assigneeId || (Array.isArray(task.assigneeId) && task.assigneeId.length === 0)) {
        const executionTime = Date.now() - startTime;
        console.log(`🚀 Individual Task Route Performance: ${executionTime}ms (early return)`);
        
        return c.json({
          data: {
            ...task,
            project: null,
            assignee: null,
            assignees: [],
          },
        });
      }

      // 3. Batch all related queries in parallel for maximum performance
      const assigneeIds = Array.isArray(task.assigneeId) ? task.assigneeId : [task.assigneeId];
      
      const [project, members] = await Promise.all([
        // Get project if exists
        task.projectId ? 
          databases.getDocument<Project>(DATABASE_ID, PROJECTS_ID, task.projectId).catch(() => null) : 
          Promise.resolve(null),
        
        // Get members in parallel
        assigneeIds.length > 0 ? 
          databases.listDocuments(DATABASE_ID, MEMBERS_ID, [Query.contains("$id", assigneeIds)]) : 
          Promise.resolve({ documents: [], total: 0 })
      ]);

      // 4. Early return if no members found
      if (members.total === 0) {
        const executionTime = Date.now() - startTime;
        console.log(`🚀 Individual Task Route Performance: ${executionTime}ms (no members)`);
        
        return c.json({
          data: {
            ...task,
            project,
            assignee: null,
            assignees: [],
          },
        });
      }

      // 5. Batch fetch all users in parallel
      const { users } = await createAdminClient();
      const uniqueUserIds = [...new Set(members.documents.map(member => member.userId))];
      
      const userPromises = uniqueUserIds.map(async (userId) => {
        try {
          const user = await users.get(userId);
          return [userId, user];
        } catch (error) {
          return [userId, { name: "Unknown User", email: "unknown@example.com" }];
        }
      });
      
      const userResults = await Promise.allSettled(userPromises);
      const usersMap = new Map();
      
      userResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const [userId, user] = result.value;
          usersMap.set(userId, user);
        }
      });

      // 6. Build assignees efficiently
      const assignees = members.documents.map((member) => {
        const user = usersMap.get(member.userId) || { 
          name: "Unknown User", 
          email: "unknown@example.com" 
        };
        
        return {
          ...member,
          name: user.name || user.email,
          email: user.email,
        };
      });

      // 7. Return optimized response with performance monitoring
      const assignee = assignees.length === 1 ? assignees[0] : assignees;
      const executionTime = Date.now() - startTime;
      console.log(`🚀 Individual Task Route Performance: ${executionTime}ms`);
      
      return c.json({
        data: {
          ...task,
          project,
          assignee,  
          assignees,  
        },
      });
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
        
        
        const uniqueUserIds = [...new Set(members.documents.map(member => member.userId))];
        const usersMap = new Map();
        
        if (uniqueUserIds.length > 0) {
          
          const userPromises = uniqueUserIds.map(async (userId) => {
            try {
              const user = await users.get(userId);
              return [userId, user];
            } catch (error) {
              return [userId, { name: "Unknown User", email: "unknown@example.com" }];
            }
          });
          
          const userResults = await Promise.allSettled(userPromises);
          userResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              const [userId, user] = result.value;
              usersMap.set(userId, user);
            }
          });
        }

        
        const assignees = members.documents.map((member) => {
          const user = usersMap.get(member.userId) || { 
            name: "Unknown User", 
            email: "unknown@example.com" 
          };
          
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        });
        
        let project = null;
        if (task.projectId) {
            try {
                project = await databases.getDocument<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    task.projectId
                );
            } catch {}
        }
        await pusherServer.trigger("tasks", "task-created", { task: { ...task, assignees, project } });

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
        
        const finalAssigneeId = assigneeId || existingTask.assigneeId;
        const assigneeIds = Array.isArray(finalAssigneeId) ? finalAssigneeId : [finalAssigneeId];
        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
        );
        
        
        const uniqueUserIds = [...new Set(members.documents.map(member => member.userId))];
        const usersMap = new Map();
        
        if (uniqueUserIds.length > 0) {
          
          const userPromises = uniqueUserIds.map(async (userId) => {
            try {
              const user = await users.get(userId);
              return [userId, user];
            } catch (error) {
              return [userId, { name: "Unknown User", email: "unknown@example.com" }];
            }
          });
          
          const userResults = await Promise.allSettled(userPromises);
          userResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              const [userId, user] = result.value;
              usersMap.set(userId, user);
            }
          });
        }

        
        const assignees = members.documents.map((member) => {
          const user = usersMap.get(member.userId) || { 
            name: "Unknown User", 
            email: "unknown@example.com" 
          };
          
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        });
        
        let project = null;
        if (task.projectId) {
            try {
                project = await databases.getDocument<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    task.projectId
                );
            } catch {}
        }
        
        const updatedTaskData = {
            ...task,
            assigneeId: finalAssigneeId, 
            assignees,
            assignee: assignees.length === 1 ? assignees[0] : assignees, 
            project
        };
        
        await pusherServer.trigger("tasks", "task-updated", { task: updatedTaskData });

        return c.json({data: updatedTaskData})
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
        
        
        const uniqueUserIds = [...new Set(members.documents.map(member => member.userId))];
        const usersMap = new Map();
        
        if (uniqueUserIds.length > 0) {
          
          const userPromises = uniqueUserIds.map(async (userId) => {
            try {
              const user = await users.get(userId);
              return [userId, user];
            } catch (error) {
              return [userId, { name: "Unknown User", email: "unknown@example.com" }];
            }
          });
          
          const userResults = await Promise.allSettled(userPromises);
          userResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              const [userId, user] = result.value;
              usersMap.set(userId, user);
            }
          });
        }

        
        const assigneesList = members.documents.map((member) => {
          const user = usersMap.get(member.userId) || { 
            name: "Unknown User", 
            email: "unknown@example.com" 
          };
          
          return {
            ...member,
            name: user.name || user.email,
            email: user.email,
          };
        });
        
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

        await pusherServer.trigger("tasks", "tasks-bulk-updated", { tasks: populatedTasks });

        return c.json({ data: updatedTasks });
    }
  )

export default app;

