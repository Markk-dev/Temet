import { InferResponseType } from "hono";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetWorkspaceAnalyticsProps {
    workspaceId: string;
}

export type WorkspaceAnalyticsResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["analytics"]["$get"], 200>;

export const useGetWorkspaceAnalytics = ({
    workspaceId, 
}: useGetWorkspaceAnalyticsProps) => {
    const query = useQuery({
        queryKey: ["workspace-analytics", workspaceId],
        queryFn: async () => {
            const response = await client.api.workspaces[":workspaceId"]["analytics"].$get({
                param: { workspaceId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch workspace analytics");
            }

            const { data } = await response.json();
            
            return data;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch if data exists
        staleTime: 10 * 60 * 1000, // Cache analytics for 10 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        retry: (failureCount, error) => {
            if (error.message.includes('4')) return false;
            return failureCount < 1; // Only retry once
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Faster retry
    });

    return query;
};