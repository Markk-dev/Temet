import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { workspace } from "./workspace";


type ResponseType = { data: workspace };
type RequestType  = InferRequestType<typeof client.api.workspaces["$post"]>;

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.workspaces["$post"]({ form });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      const json = await response.json();
      return json as ResponseType;
    },
    onSuccess: () => {
      toast.success("Workspace created");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error) => {
      console.error("Workspace creation error:", error);
      toast.error("Failed to create workspace. Please try again.");
    },
  });
};
