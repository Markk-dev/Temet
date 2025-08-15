"use client";

import { usePrefetchData } from "@/hooks/use-prefetch-data";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { useCallback } from "react";

interface NavigationOptimizerProps {
    children: React.ReactNode;
}

export const NavigationOptimizer = ({ children }: NavigationOptimizerProps) => {
    const workspaceId = useWorkspaceId();
    const { prefetchWorkspaceData } = usePrefetchData();

    const handleNavigationHover = useCallback(() => {
        if (workspaceId) {
            // Prefetch data when user hovers over navigation
            prefetchWorkspaceData(workspaceId);
        }
    }, [workspaceId, prefetchWorkspaceData]);

    return (
        <div onMouseEnter={handleNavigationHover}>
            {children}
        </div>
    );
}; 