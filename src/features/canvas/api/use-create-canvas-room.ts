import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<typeof client.api.canvas.$post, 200>;
type RequestType = InferRequestType<typeof client.api.canvas.$post>["json"];

export const useCreateCanvasRoom = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.canvas.$post({ json });

      if (!response.ok) {
        throw new Error("Failed to create canvas room");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Canvas room created");
      queryClient.invalidateQueries({ queryKey: ["canvas-rooms", data.data.workspaceId] });
    },
    onError: () => {
      toast.error("Failed to create canvas room");
    },
  });

  return mutation;
};