import { Models } from "node-appwrite";

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
}

export interface TimeLog {
    id: string;
    started_at: string; // ISO date string when task moved to IN_PROGRESS
    ended_at?: string;  // ISO date string when task moved away from IN_PROGRESS, undefined if still active
}

export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    workspaceId: string;
    assigneeId: string[];
    projectId: string;
    position: number;
    dueDate: string;
    description?: string;
    timeLogs: string; // JSON string containing TimeLog[] array
    totalTimeSpent: number;
    lastActiveAt?: string;
}