import { Models } from "node-appwrite";

export type CanvasRoom = Models.Document & {
  name: string;
  workspaceId: string;
  createdBy: string;
  lastModified: string;
  collaborators: string[];
  isPublic: boolean;
  thumbnailUrl?: string;
};

export type CanvasRoomMember = {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
};

export type CanvasPermission = {
  canEdit: boolean;
  canView: boolean;
  canDelete: boolean;
  canInvite: boolean;
};