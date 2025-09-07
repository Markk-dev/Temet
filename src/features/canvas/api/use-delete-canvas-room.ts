import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.canvas[":roomId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.canvas[":roomId"]["$delete"]>;

export const useDeleteCanvasRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.canvas[":roomId"].$delete({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete canvas room");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Canvas room deleted");
      queryClient.invalidateQueries({ queryKey: ["canvas-rooms"] });
      queryClient.removeQueries({ queryKey: ["canvas-room", data.data.$id] });
    },
    onError: () => {
      toast.error("Failed to delete canvas room");
    },
  });

  return mutation;
};