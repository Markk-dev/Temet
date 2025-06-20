import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
import { workspace } from "./workspace";


// type ResponseType = { data: workspace };
type ResponseType  = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$delete"], 200>;
type RequestType  = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$delete"]>;

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.workspaces[":workspaceId"]["$delete"]({ param });

      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }

      const json = await response.json();
      return json as ResponseType;
    },
    onSuccess: ({data}) => {
      toast.success("Workspace deleted");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] });
    },
    onError: () => {
      toast.error("Failed to delete workspace");
    },
  });
};
