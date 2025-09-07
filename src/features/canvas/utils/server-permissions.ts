import { Databases } from "node-appwrite";
import { getCanvasRoomPermissions } from "../utils";
import { CanvasPermission } from "../types";

export interface PermissionCheckResult {
  hasPermission: boolean;
  permissions: CanvasPermission;
  error?: string;
}

/**
 * Server-side utility to check canvas permissions
 */
export const checkCanvasPermission = async ({
  databases,
  roomId,
  userId,
  requiredPermission,
}: {
  databases: Databases;
  roomId: string;
  userId: string;
  requiredPermission: keyof CanvasPermission;
}): Promise<PermissionCheckResult> => {
  try {
    const permissions = await getCanvasRoomPermissions({
      databases,
      roomId,
      userId,
    });

    return {
      hasPermission: permissions[requiredPermission],
      permissions,
    };
  } catch (error) {
    console.error("Error checking canvas permission:", error);
    return {
      hasPermission: false,
      permissions: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canInvite: false,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Higher-order function to wrap API route handlers with permission checks
 */
export const withCanvasPermission = (
  requiredPermission: keyof CanvasPermission,
  handler: (context: any) => Promise<Response>
) => {
  return async (context: any) => {
    const { databases, user, roomId } = context;

    if (!databases || !user || !roomId) {
      return new Response(
        JSON.stringify({ error: "Missing required context" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const permissionCheck = await checkCanvasPermission({
      databases,
      roomId,
      userId: user.$id,
      requiredPermission,
    });

    if (!permissionCheck.hasPermission) {
      return new Response(
        JSON.stringify({ 
          error: "Insufficient permissions",
          required: requiredPermission,
          current: permissionCheck.permissions
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add permissions to context for use in handler
    context.permissions = permissionCheck.permissions;
    
    return handler(context);
  };
};

/**
 * Utility to validate multiple permissions at once
 */
export const checkMultipleCanvasPermissions = async ({
  databases,
  roomId,
  userId,
  requiredPermissions,
}: {
  databases: Databases;
  roomId: string;
  userId: string;
  requiredPermissions: (keyof CanvasPermission)[];
}): Promise<PermissionCheckResult & { missingPermissions: string[] }> => {
  try {
    const permissions = await getCanvasRoomPermissions({
      databases,
      roomId,
      userId,
    });

    const missingPermissions = requiredPermissions.filter(
      permission => !permissions[permission]
    );

    return {
      hasPermission: missingPermissions.length === 0,
      permissions,
      missingPermissions,
    };
  } catch (error) {
    console.error("Error checking multiple canvas permissions:", error);
    return {
      hasPermission: false,
      permissions: {
        canView: false,
        canEdit: false,
        canDelete: false,
        canInvite: false,
      },
      missingPermissions: requiredPermissions,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};