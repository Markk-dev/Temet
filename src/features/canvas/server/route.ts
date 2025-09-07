import { z } from 'zod';
import { Hono } from 'hono';
import { ID, Query } from 'node-appwrite';
import { zValidator } from '@hono/zod-validator';

import { MemberRole } from '@/features/members/types';
import { getMembers } from '@/features/members/utils';
import { SessionMiddleware } from '@/lib/session-middleware';
import { DATABASE_ID, CANVAS_ROOMS_ID, MEMBERS_ID } from '@/config';

import { CanvasRoom } from '../types';
import { 
  createCanvasRoomSchema, 
  updateCanvasRoomSchema,
  addCollaboratorSchema,
  updateCollaboratorRoleSchema 
} from '../schemas';
import { getCanvasRoomPermissions } from '../utils';
import { checkCanvasPermission, withCanvasPermission } from '../utils/server-permissions';

const app = new Hono()
  .get(
    "/workspace/:workspaceId",
    SessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { workspaceId } = c.req.param();
      
      // Check if user is a member of the workspace
      const member = await getMembers({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const canvasRooms = await databases.listDocuments(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          [
            Query.equal('workspaceId', workspaceId),
            Query.orderDesc("$createdAt"),
          ]
        );

        return c.json({ data: canvasRooms });
      } catch (error) {
        console.error("Error fetching canvas rooms:", error);
        return c.json({ error: "Failed to fetch canvas rooms" }, 500);
      }
    }
  )
  .get(
    "/:roomId",
    SessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { roomId } = c.req.param();
      
      // Use the permission utility to check access
      const permissionCheck = await checkCanvasPermission({
        databases,
        roomId,
        userId: user.$id,
        requiredPermission: "canView",
      });

      if (!permissionCheck.hasPermission) {
        // If user is not a workspace member and room is private, return 401
        try {
          const canvasRoom = await databases.getDocument<CanvasRoom>(
            DATABASE_ID,
            CANVAS_ROOMS_ID,
            roomId
          );
          const member = await getMembers({
            databases,
            workspaceId: canvasRoom.workspaceId,
            userId: user.$id,
          });
          if (!member && !canvasRoom.isPublic) {
            return c.json({ error: "Unauthorized" }, 401);
          }
        } catch {}
        return c.json({ error: "Access denied" }, 403);
      }

      try {
        const canvasRoom = await databases.getDocument<CanvasRoom>(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          roomId
        );

        return c.json({ data: canvasRoom });
      } catch (error: any) {
        if (error.code === 404) {
          return c.json({ error: "Canvas room not found" }, 404);
        }
        console.error("Error fetching canvas room:", error);
        return c.json({ error: "Failed to fetch canvas room" }, 500);
      }
    }
  )
  .post(
    "/",
    zValidator("json", createCanvasRoomSchema),
    SessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { name, workspaceId, isPublic } = c.req.valid("json");
      
      // Check if user is a member of the workspace
      const member = await getMembers({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const canvasRoom = await databases.createDocument(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          ID.unique(),
          {
            name,
            workspaceId,
            createdBy: user.$id,
            lastModified: new Date().toISOString(),
            collaborators: [user.$id], // Creator is automatically a collaborator
            isPublic,
          }
        );

        return c.json({ data: canvasRoom });
      } catch (error) {
        console.error("Error creating canvas room:", error);
        return c.json({ error: "Failed to create canvas room" }, 500);
      }
    }
  )
  .patch(
    "/:roomId",
    zValidator("json", updateCanvasRoomSchema),
    SessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { roomId } = c.req.param();
      const updateData = c.req.valid("json");
      
      // Check edit permission
      const permissionCheck = await checkCanvasPermission({
        databases,
        roomId,
        userId: user.$id,
        requiredPermission: "canEdit",
      });

      if (!permissionCheck.hasPermission) {
        // Unauthorized when user is not owner/admin/collaborator
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      try {
        const updatedRoom = await databases.updateDocument(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          roomId,
          {
            ...updateData,
            lastModified: new Date().toISOString(),
          }
        );

        return c.json({ data: updatedRoom });
      } catch (error: any) {
        if (error.code === 404) {
          return c.json({ error: "Canvas room not found" }, 404);
        }
        console.error("Error updating canvas room:", error);
        return c.json({ error: "Failed to update canvas room" }, 500);
      }
    }
  )
  .delete(
    "/:roomId",
    SessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { roomId } = c.req.param();
      
      // Check delete permission
      const permissionCheck = await checkCanvasPermission({
        databases,
        roomId,
        userId: user.$id,
        requiredPermission: "canDelete",
      });

      if (!permissionCheck.hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      
      try {
        await databases.deleteDocument(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          roomId
        );

        return c.json({ data: { $id: roomId } });
      } catch (error: any) {
        if (error.code === 404) {
          return c.json({ error: "Canvas room not found" }, 404);
        }
        console.error("Error deleting canvas room:", error);
        return c.json({ error: "Failed to delete canvas room" }, 500);
      }
    }
  )
  .post(
    "/:roomId/collaborators",
    zValidator("json", addCollaboratorSchema),
    SessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { roomId } = c.req.param();
      const { userId: collaboratorId } = c.req.valid("json");
      
      // Check invite permission
      const permissionCheck = await checkCanvasPermission({
        databases,
        roomId,
        userId: user.$id,
        requiredPermission: "canInvite",
      });

      if (!permissionCheck.hasPermission) {
        return c.json({ error: "Insufficient permissions to invite collaborators" }, 403);
      }
      
      try {
        const canvasRoom = await databases.getDocument<CanvasRoom>(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          roomId
        );

        // Check if collaborator is already added
        if (canvasRoom.collaborators.includes(collaboratorId)) {
          return c.json({ error: "User is already a collaborator" }, 400);
        }

        // Verify the collaborator is a member of the workspace
        const collaboratorMember = await getMembers({
          databases,
          workspaceId: canvasRoom.workspaceId,
          userId: collaboratorId,
        });

        if (!collaboratorMember) {
          return c.json({ error: "User is not a member of this workspace" }, 400);
        }

        const updatedCollaborators = [...canvasRoom.collaborators, collaboratorId];
        
        const updatedRoom = await databases.updateDocument(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          roomId,
          {
            collaborators: updatedCollaborators,
            lastModified: new Date().toISOString(),
          }
        );

        return c.json({ data: updatedRoom });
      } catch (error: any) {
        if (error.code === 404) {
          return c.json({ error: "Canvas room not found" }, 404);
        }
        console.error("Error adding collaborator:", error);
        return c.json({ error: "Failed to add collaborator" }, 500);
      }
    }
  )
  .delete(
    "/:roomId/collaborators/:userId",
    SessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { roomId, userId: collaboratorId } = c.req.param();
      
      try {
        const canvasRoom = await databases.getDocument<CanvasRoom>(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          roomId
        );

        // Check if user has permission to remove collaborators
        const member = await getMembers({
          databases,
          workspaceId: canvasRoom.workspaceId,
          userId: user.$id,
        });

        const isOwner = canvasRoom.createdBy === user.$id;
        const isWorkspaceAdmin = member?.role === MemberRole.ADMIN;
        const isSelf = user.$id === collaboratorId;

        if (!isOwner && !isWorkspaceAdmin && !isSelf) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Cannot remove the owner
        if (collaboratorId === canvasRoom.createdBy) {
          return c.json({ error: "Cannot remove the room owner" }, 400);
        }

        const updatedCollaborators = canvasRoom.collaborators.filter(
          id => id !== collaboratorId
        );
        
        const updatedRoom = await databases.updateDocument(
          DATABASE_ID,
          CANVAS_ROOMS_ID,
          roomId,
          {
            collaborators: updatedCollaborators,
            lastModified: new Date().toISOString(),
          }
        );

        return c.json({ data: updatedRoom });
      } catch (error: any) {
        if (error.code === 404) {
          return c.json({ error: "Canvas room not found" }, 404);
        }
        console.error("Error removing collaborator:", error);
        return c.json({ error: "Failed to remove collaborator" }, 500);
      }
    }
  )
  .get(
    "/:roomId/permissions",
    SessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { roomId } = c.req.param();
      
      try {
        const permissions = await getCanvasRoomPermissions({
          databases,
          roomId,
          userId: user.$id,
        });

        return c.json({ data: permissions });
      } catch (error) {
        console.error("Error getting canvas permissions:", error);
        return c.json({ error: "Failed to get permissions" }, 500);
      }
    }
  );

export default app;