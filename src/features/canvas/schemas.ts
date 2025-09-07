import { z } from "zod";

export const createCanvasRoomSchema = z.object({
  name: z.string().trim().min(1, "Room name is required").max(100, "Room name too long"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  isPublic: z.boolean().default(false),
});

export const updateCanvasRoomSchema = z.object({
  name: z.string().trim().min(1, "Room name is required").max(100, "Room name too long").optional(),
  isPublic: z.boolean().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
});

export const addCollaboratorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(['editor', 'viewer']).default('editor'),
});

export const updateCollaboratorRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(['editor', 'viewer']),
});