import { z } from "zod";
import { TaskStatus } from "./types";

// Schema for a single time log entry
export const timeLogSchema = z.object({
  id: z.string().min(1, "Required"),
  memberId: z.string().min(1, "Required"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().int().nonnegative().optional(),
});

export const createTaskSchema = z.object({
  name: z.string().min(1, "Required").max(60, "Task name should not exceed 60 characters"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  dueDate: z.coerce.date(),
  assigneeId: z.array(z.string().trim().min(1, "Required")).min(1, "Required"),
  description: z.string().optional(),
  timeLogs: z.array(timeLogSchema).optional().default([]),
  totalTimeSpent: z.number().int().nonnegative().optional().default(0),
  lastActiveAt: z.string().datetime().optional(),
});

// Schema for updating a task
export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().min(1, "Required"),
  // Make these fields optional for updates
  name: z.string().min(1, "Required").max(60, "Task name should not exceed 60 characters").optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  workspaceId: z.string().trim().min(1, "Required").optional(),
  projectId: z.string().trim().min(1, "Required").optional(),
  dueDate: z.coerce.date().optional(),
  assigneeId: z.array(z.string().trim().min(1, "Required")).min(1, "Required").optional(),
});

// Schema for starting/stopping time tracking
export const timeTrackingSchema = z.object({
  taskId: z.string().min(1, "Required"),
  action: z.enum(["start", "stop"]),
});

// Schema for the complete task with all fields
export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.nativeEnum(TaskStatus),
  workspaceId: z.string(),
  projectId: z.string(),
  position: z.number(),
  dueDate: z.string().datetime(),
  description: z.string().optional(),
  assigneeId: z.array(z.string()),
  timeLogs: z.array(timeLogSchema).default([]),
  totalTimeSpent: z.number().int().nonnegative().default(0),
  lastActiveAt: z.string().datetime().optional(),
  $id: z.string().optional(),
  $createdAt: z.string().datetime().optional(),
  $updatedAt: z.string().datetime().optional(),
  $permissions: z.array(z.string()).optional(),
  $databaseId: z.string().optional(),
  $collectionId: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TimeTrackingInput = z.infer<typeof timeTrackingSchema>;
export type TaskSchema = z.infer<typeof taskSchema>;