import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.canvas[":roomId"]["collaborators"][":userId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.canvas[":roomId"]["collaborators"][":userId"]["$delete"]>;

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.canvas[":roomId"]["collaborators"][":userId"].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to remove collaborator");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Collaborator removed");
      queryClient.invalidateQueries({ queryKey: ["canvas-room", data.data.$id] });
      queryClient.invalidateQueries({ queryKey: ["canvas-rooms", data.data.workspaceId] });
    },
    onError: () => {
      toast.error("Failed to remove collaborator");
    },
  });

  return mutation;
};