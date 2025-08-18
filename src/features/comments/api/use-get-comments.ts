import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetCommentsProps {
    taskId: string;
}

export const useGetComments = (taskId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ["comments", taskId, workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/comments/${taskId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      return response.json();
    },
    enabled: !!taskId && !!workspaceId,
  });
}; 