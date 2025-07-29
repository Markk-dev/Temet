import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface useGetTasksProps {
    workspaceId: string;
    projectId?: string | null;
    status?: TaskStatus | null;
    assigneeId?: string | null;
    dueDate?: string | null;
    search?: string | null;
};

export const useGetTasks = ({
    workspaceId,
    projectId,
    status,
    search,
    assigneeId,
    dueDate,

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
                   
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const { data } = await response.json();
            
            return data;
        },
        refetchOnWindowFocus: false,
        staleTime: 30000, // Cache for 30 seconds to reduce API calls
        gcTime: 300000, // Keep in cache for 5 minutes
        retry: (failureCount, error) => {
            // Don't retry on 4xx errors, only on network issues
            if (error.message.includes('4')) return false;
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return query;
}