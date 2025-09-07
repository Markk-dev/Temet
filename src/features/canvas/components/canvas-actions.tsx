"use client";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, UserPlus, Share } from "lucide-react";
import { CanvasPermissionGuard, useCanvasPermission } from "./canvas-permission-guard";
import { useCanvas } from "./canvas-provider";
import { useDeleteCanvasRoom } from "../api/use-delete-canvas-room";
import { toast } from "sonner";

interface CanvasActionsProps {
  roomId: string;
  onEdit?: () => void;
  onShare?: () => void;
  onInvite?: () => void;
  onDelete?: () => void;
}

export const CanvasActions = ({ 
  roomId, 
  onEdit, 
  onShare, 
  onInvite, 
  onDelete 
}: CanvasActionsProps) => {
  const { room } = useCanvas();
  const deleteCanvasRoom = useDeleteCanvasRoom();

  const { hasPermission: canEdit } = useCanvasPermission({ 
    roomId, 
    requiredPermission: "canEdit" 
  });
  
  const { hasPermission: canDelete } = useCanvasPermission({ 
    roomId, 
    requiredPermission: "canDelete" 
  });
  
  const { hasPermission: canInvite } = useCanvasPermission({ 
    roomId, 
    requiredPermission: "canInvite" 
  });

  const handleDelete = async () => {
    if (!room) return;
    
    try {
      await deleteCanvasRoom.mutateAsync({ param: { roomId } });
      onDelete?.();
    } catch (error) {
      toast.error("Failed to delete canvas room");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onShare}>
          <Share className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
        
        {canEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        
        {canInvite && (
          <DropdownMenuItem onClick={onInvite}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Collaborators
          </DropdownMenuItem>
        )}
        
        {canDelete && (
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface CanvasEditButtonProps {
  roomId: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const CanvasEditButton = ({ roomId, onClick, disabled }: CanvasEditButtonProps) => {
  return (
    <CanvasPermissionGuard
      roomId={roomId}
      requiredPermission="canEdit"
      fallback={null}
    >
      <Button onClick={onClick} disabled={disabled}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Canvas
      </Button>
    </CanvasPermissionGuard>
  );
};

interface CanvasDeleteButtonProps {
  roomId: string;
  onDelete?: () => void;
}

export const CanvasDeleteButton = ({ roomId, onDelete }: CanvasDeleteButtonProps) => {
  const deleteCanvasRoom = useDeleteCanvasRoom();

  const handleDelete = async () => {
    try {
      await deleteCanvasRoom.mutateAsync({ param: { roomId } });
      onDelete?.();
    } catch (error) {
      toast.error("Failed to delete canvas room");
    }
  };

  return (
    <CanvasPermissionGuard
      roomId={roomId}
      requiredPermission="canDelete"
      fallback={null}
    >
      <Button 
        variant="destructive" 
        onClick={handleDelete}
        disabled={deleteCanvasRoom.isPending}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Canvas
      </Button>
    </CanvasPermissionGuard>
  );
};