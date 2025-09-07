import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.canvas[":roomId"]["$patch"], 200>;
type RequestType = InferRequestType<typeof client.api.canvas[":roomId"]["$patch"]>;

export const useUpdateCanvasRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.canvas[":roomId"].$patch({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to update canvas room");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Canvas room updated");
      queryClient.invalidateQueries({ queryKey: ["canvas-room", data.data.$id] });
      queryClient.invalidateQueries({ queryKey: ["canvas-rooms", data.data.workspaceId] });
    },
    onError: () => {
      toast.error("Failed to update canvas room");
    },
  });

  return mutation;
};