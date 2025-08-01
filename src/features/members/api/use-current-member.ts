import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";

export const useCurrentMember = () => {
  const workspaceId = useWorkspaceId();
  
  const query = useQuery({
    queryKey: ["current-member", workspaceId],
    queryFn: async () => {
      const response = await client.api.members["current-member"][":workspaceId"].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        return null;
      }

      const { data } = await response.json();
      return data;
    },
    enabled: !!workspaceId,
  });

  return query;
}; 