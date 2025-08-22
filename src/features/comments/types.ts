import { Models } from "node-appwrite";

export interface Comment extends Models.Document {
    taskId: string;
    workspaceId: string;
    content: string;
    authorId: string;
    parentId?: string;
    priority?: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";
    pinnedFields?: string[];
    pinnedFieldValues?: {
        assignee?: any;
        status?: string;
        dueDate?: string;
    };
    mentions?: string[];
    replies?: Comment[];
    author?: {
        name: string;
        email: string;
    };
} 