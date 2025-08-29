import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface useGetTasksProps {
    workspaceId: string;
    projectId?: string | null;
    status?: string | null;
    assigneeId?: string | null;
    dueDate?: string | null;
    search?: string | null;
    page?: number;
    limit?: number;
};

export const useGetTasks = ({
    workspaceId,
    projectId,
    status,
    search,
    assigneeId,
    dueDate,
    page = 1,
    limit = 50
}: useGetTasksProps) => {

    const query = useQuery({
        queryKey: [
            "tasks",
            workspaceId,
            projectId,
            status,
            search,
            assigneeId,
            dueDate,
            page,
            limit
        ],
        queryFn: async () => {
            const response = await client.api.tasks.$get({
                query: {
                    workspaceId,
                    projectId: projectId ?? undefined,
                    status: status ?? undefined,
                    assigneeId: assigneeId ?? undefined,
                    search: search ?? undefined,
                    dueDate: dueDate ?? undefined,
                    page: page.toString(),
                    limit: limit.toString(),
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const { data } = await response.json();
            
            return data;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch if data exists
        staleTime: 30 * 1000, // Cache for 30 seconds (real-time collaboration)
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
        retry: (failureCount, error) => {
            // Don't retry on 4xx errors, only on network issues
            if (error.message.includes('4')) return false;
            return failureCount < 1; // Only retry once
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Faster retry
        // Enable pagination support
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });

    return query;
};