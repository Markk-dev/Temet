import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.canvas[":roomId"]["collaborators"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.canvas[":roomId"]["collaborators"]["$post"]>;

export const useAddCollaborator = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.canvas[":roomId"]["collaborators"].$post({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to add collaborator");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Collaborator added");
      queryClient.invalidateQueries({ queryKey: ["canvas-room", data.data.$id] });
      queryClient.invalidateQueries({ queryKey: ["canvas-rooms", data.data.workspaceId] });
    },
    onError: () => {
      toast.error("Failed to add collaborator");
    },
  });

  return mutation;
};