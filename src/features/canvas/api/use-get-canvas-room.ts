import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetCanvasRoomProps {
  roomId: string;
}

export const useGetCanvasRoom = ({ roomId }: UseGetCanvasRoomProps) => {
  const query = useQuery({
    queryKey: ["canvas-room", roomId],
    queryFn: async () => {
      const response = await client.api.canvas[":roomId"].$get({
        param: { roomId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch canvas room");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};