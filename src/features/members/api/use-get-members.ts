import { client } from "@/lib/rpc";

import { useQuery } from "@tanstack/react-query";

interface useGetMembersProps {
    workspaceId: string;
}

export const useGetMembers = ({
    workspaceId,
}: useGetMembersProps) => {
    const query = useQuery({
        queryKey: ["members", workspaceId],
        queryFn: async () => {
            const response = await client.api.members.$get({ query: { workspaceId }});

            if (!response.ok) {
                throw new Error("Failed to fetch members");
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