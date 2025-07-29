import { InferResponseType } from "hono";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetProjectAnalyticsProps {
    projectId: string;
}

export type ProjectAnalyticsResponseType = InferResponseType<typeof client.api.projects[":projectId"]["analytics"]["$get"], 200>;

export const useGetProjectAnalytics = ({
    projectId, 
}: useGetProjectAnalyticsProps) => {
    const query = useQuery({
        queryKey: ["project-analytics", projectId],
        queryFn: async () => {
            const response = await client.api.projects[":projectId"]["analytics"].$get({
                param: { projectId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch project analytics");
            }

            const { data } = await response.json();
            
            return data;
        },
        refetchOnWindowFocus: false,
        staleTime: 60000, // Cache analytics for 1 minute
        gcTime: 600000, // Keep in cache for 10 minutes
        retry: (failureCount, error) => {
            if (error.message.includes('4')) return false;
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return query;
}