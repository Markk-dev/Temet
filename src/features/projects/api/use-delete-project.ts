import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType  = InferResponseType<typeof client.api.projects[":projectId"]["$delete"], 200>;
type RequestType  = InferRequestType<typeof client.api.projects[":projectId"]["$delete"]>;

export const useDeleteProject = () => {

  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param}) => {
      const response = await client.api.projects[":projectId"]["$delete"]({ param });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      const json = await response.json();
      return json as ResponseType;
    },

    onSuccess: ({ data }) => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.$id] });

    },
    onError: () => {
      toast.error("Failed to delete project");

    },
  });
};
