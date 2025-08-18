import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { UpdateCommentInput } from "../schemas";

interface UseUpdateCommentProps {
    taskId: string;
}

export const useUpdateComment = ({ taskId }: UseUpdateCommentProps) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ commentId, data }: { commentId: string; data: UpdateCommentInput }) => {
            const response = await client.api.comments[":commentId"].$patch({ 
                param: { commentId },
                json: data 
            });

            if (!response.ok) {
                throw new Error("Failed to update comment");
            }

            const result = await response.json();
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: ["comments", taskId] 
            });
        },
    });

    return mutation;
}; 