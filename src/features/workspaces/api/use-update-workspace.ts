import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

import { client } from "@/lib/rpc";
// import { workspace } from "./workspace";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>;
type RequestType  = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>;

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const response = await client.api.workspaces[":workspaceId"]["$patch"]({ form, param });

      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }

      const json = await response.json();
      return json as ResponseType;
    },
    onSuccess: ({ data}) => {
      toast.success("Workspace updated");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] });
    },
    onError: () => {
      toast.error("Failed to create workspace");
    },
  });
};
