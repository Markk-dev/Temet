import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { CanvasPermission } from "../types";

interface UseCanvasPermissionsProps {
  roomId: string;
  enabled?: boolean;
}

export const useCanvasPermissions = ({ roomId, enabled = true }: UseCanvasPermissionsProps) => {
  const query = useQuery({
    queryKey: ["canvas-permissions", roomId],
    queryFn: async (): Promise<CanvasPermission> => {
      const response = await client.api.canvas[":roomId"].$get({
        param: { roomId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch canvas room");
      }

      const { data: canvasRoom } = await response.json();
      
      // Get current user from session (this would typically come from a user context)
      // For now, we'll make another API call to get permissions
      const permissionsResponse = await client.api.canvas[":roomId"]["permissions"].$get({
        param: { roomId },
      });

      if (!permissionsResponse.ok) {
        // Fallback to basic permissions based on room data
        return {
          canView: canvasRoom.isPublic,
          canEdit: false,
          canDelete: false,
          canInvite: false,
        };
      }

      const { data: permissions } = await permissionsResponse.json();
      return permissions;
    },
    enabled,
  });

  return query;
};