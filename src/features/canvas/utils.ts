import { Databases } from "node-appwrite";
import { DATABASE_ID, CANVAS_ROOMS_ID } from "@/config";
import { MemberRole } from "@/features/members/types";
import { CanvasRoom, CanvasPermission } from "./types";
import { getMembers } from "@/features/members/utils";

export const getCanvasRoomPermissions = async ({
  databases,
  roomId,
  userId,
}: {
  databases: Databases;
  roomId: string;
  userId: string;
}): Promise<CanvasPermission> => {
  try {
    const canvasRoom = await databases.getDocument<CanvasRoom>(
      DATABASE_ID,
      CANVAS_ROOMS_ID,
      roomId
    );

    // Check workspace membership via shared utility (mocked in tests)
    const member = await getMembers({
      databases,
      workspaceId: canvasRoom.workspaceId,
      userId,
    });
    const isWorkspaceMember = !!member;
    const isWorkspaceAdmin = member?.role === MemberRole.ADMIN;
    const isOwner = canvasRoom.createdBy === userId;
    const isCollaborator = canvasRoom.collaborators.includes(userId);

    // Determine permissions
    const canView = isWorkspaceMember || isCollaborator || canvasRoom.isPublic;
    const canEdit = isOwner || isWorkspaceAdmin || isCollaborator;
    const canDelete = isOwner || isWorkspaceAdmin;
    const canInvite = isOwner || isWorkspaceAdmin;

    return {
      canView,
      canEdit,
      canDelete,
      canInvite,
    };
  } catch (error) {
    console.error("Error getting canvas room permissions:", error);
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canInvite: false,
    };
  }
};

export const validateCanvasRoomAccess = async ({
  databases,
  roomId,
  userId,
  requiredPermission,
}: {
  databases: Databases;
  roomId: string;
  userId: string;
  requiredPermission: keyof CanvasPermission;
}): Promise<boolean> => {
  const permissions = await getCanvasRoomPermissions({
    databases,
    roomId,
    userId,
  });

  return permissions[requiredPermission];
};

export const generateRoomId = (workspaceId: string, roomName: string): string => {
  const timestamp = Date.now();
  const hasSymbols = /[^a-z0-9\s]/i.test(roomName);
  const tokens = (roomName.toLowerCase().match(/[a-z0-9]+/g) || []);
  const joiner = hasSymbols ? '----' : '-';
  const name = tokens.join(joiner);
  return `${workspaceId}-${name}${joiner}${timestamp}`;
};