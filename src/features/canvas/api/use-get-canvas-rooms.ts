import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetCanvasRoomsProps {
  workspaceId: string;
}

export const useGetCanvasRooms = ({ workspaceId }: UseGetCanvasRoomsProps) => {
  const query = useQuery({
    queryKey: ["canvas-rooms", workspaceId],
    queryFn: async () => {
      const response = await client.api.canvas["workspace"][":workspaceId"].$get({
        param: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch canvas rooms");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};