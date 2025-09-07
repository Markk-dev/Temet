"use client";

import { ReactNode } from "react";
import { useCanvasPermissions } from "../hooks/use-canvas-permissions";
import { CanvasPermission } from "../types";

interface CanvasPermissionGuardProps {
  roomId: string;
  requiredPermission: keyof CanvasPermission;
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
}

export const CanvasPermissionGuard = ({
  roomId,
  requiredPermission,
  children,
  fallback = null,
  loading = <div>Loading permissions...</div>,
}: CanvasPermissionGuardProps) => {
  const { data: permissions, isLoading, error } = useCanvasPermissions({ roomId });

  if (isLoading) {
    return <>{loading}</>;
  }

  if (error || !permissions) {
    return <>{fallback}</>;
  }

  if (!permissions[requiredPermission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface UseCanvasPermissionProps {
  roomId: string;
  requiredPermission: keyof CanvasPermission;
}

export const useCanvasPermission = ({ roomId, requiredPermission }: UseCanvasPermissionProps) => {
  const { data: permissions, isLoading, error } = useCanvasPermissions({ roomId });

  return {
    hasPermission: permissions?.[requiredPermission] ?? false,
    isLoading,
    error,
  };
};