import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ResponseType  = InferResponseType<typeof client.api.projects[":projectId"]["$patch"], 200>;
type RequestType  = InferRequestType<typeof client.api.projects[":projectId"]["$patch"]>;

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param}) => {
      const response = await client.api.projects[":projectId"]["$patch"]({ form, param });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const json = await response.json();
      return json as ResponseType;
    },

    onSuccess: ({ data }) => {
      toast.success("Project update");
      
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // <-- Add this line
    },
    onError: () => {
      toast.error("Failed to update project");

    },
  });
};
