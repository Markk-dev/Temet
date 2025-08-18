import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { CreateCommentInput } from "../schemas";

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: CreateCommentInput) => {
            const response = await client.api.comments.$post({ json: data });

            if (!response.ok) {
                throw new Error("Failed to create comment");
            }

            const result = await response.json();
            return result.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ 
                queryKey: ["comments", variables.taskId] 
            });
        },
    });

    return mutation;
}; 