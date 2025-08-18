import { z } from "zod";

export const createCommentSchema = z.object({
    taskId: z.string().min(1, "Task ID is required"),
    workspaceId: z.string().min(1, "Workspace ID is required"),
    content: z.string().min(1, "Comment content is required").max(2048, "Comment too long"),
    parentId: z.string().optional(),
    priority: z.enum(["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST"]).optional(),
    pinnedFields: z.array(z.string()).optional(),
    mentions: z.array(z.string()).optional(),
});

export const updateCommentSchema = z.object({
    content: z.string().min(1, "Comment content is required").max(2048, "Comment too long"),
    priority: z.enum(["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST"]).optional(),
    pinnedFields: z.array(z.string()).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>; 