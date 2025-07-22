import { z } from "zod";
import { TaskStatus } from "./types";

export const createTaskSchema = z.object({
    name: z.string().min(1, "Required").max(60, "Task name should not exceed 60 characters"),
    status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
    workspaceId: z.string().trim().min(1, "Required"),
    projectId: z.string().trim().min(1, "Required"),
    dueDate: z.coerce.date(),
    assigneeId: z.array(z.string().trim().min(1, "Required")).min(1, "Required"),
    // assigneeId: z.string().trim().min(1, "Required"),
    description: z.string().optional(),
})