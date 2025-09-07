"use client";

import { ReactNode, createContext, useContext } from "react";
import { useCanvasPermissions } from "../hooks/use-canvas-permissions";
import { useGetCanvasRoom } from "../api/use-get-canvas-room";
import { CanvasRoom, CanvasPermission } from "../types";

interface CanvasContextValue {
  room: CanvasRoom | undefined;
  permissions: CanvasPermission | undefined;
  isLoading: boolean;
  error: Error | null;
}

const CanvasContext = createContext<CanvasContextValue | undefined>(undefined);

interface CanvasProviderProps {
  roomId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const CanvasProvider = ({ roomId, children, fallback }: CanvasProviderProps) => {
  const { 
    data: room, 
    isLoading: roomLoading, 
    error: roomError 
  } = useGetCanvasRoom({ roomId });
  
  const { 
    data: permissions, 
    isLoading: permissionsLoading, 
    error: permissionsError 
  } = useCanvasPermissions({ roomId, enabled: !!room });

  const isLoading = roomLoading || permissionsLoading;
  const error = roomError || permissionsError;

  // Show fallback if no view permission
  if (!isLoading && permissions && !permissions.canView) {
    return <>{fallback || <div>Access denied to this canvas room.</div>}</>;
  }

  const contextValue: CanvasContextValue = {
    room,
    permissions,
    isLoading,
    error,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};

export const useCanvasRoom = () => {
  const { room } = useCanvas();
  return room;
};

export const useCanvasPermissionsContext = () => {
  const { permissions } = useCanvas();
  return permissions;
};