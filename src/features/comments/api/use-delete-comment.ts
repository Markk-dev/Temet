import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseDeleteCommentProps {
    taskId: string;
}

export const useDeleteComment = ({ taskId }: UseDeleteCommentProps) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await client.api.comments[":commentId"].$delete({ 
                param: { commentId } 
            });

            if (!response.ok) {
                throw new Error("Failed to delete comment");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ 
                queryKey: ["comments", taskId] 
            });
        },
    });

    return mutation;
}; 