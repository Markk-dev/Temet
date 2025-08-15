import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface useGetProjectsProps {
    workspaceId: string;
}

export const useGetProjects = ({
    workspaceId, 
}: useGetProjectsProps) => {
    const query = useQuery({
        queryKey: ["projects", workspaceId],
        queryFn: async () => {
            const response = await client.api.projects.$get({
                query: {
                    workspaceId,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }

            const { data } = await response.json();
            
            return data;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch if data exists
        staleTime: 15 * 60 * 1000, // Cache for 15 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
        retry: (failureCount, error) => {
            if (error.message.includes('4')) return false;
            return failureCount < 1; // Only retry once
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Faster retry
    });

    return query;
};