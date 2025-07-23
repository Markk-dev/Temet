import Pusher from "pusher-js";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseProjectSocketProps {
  workspaceId: string;
}

export const useProjectSocket = ({ workspaceId }: UseProjectSocketProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "ap1",
    });

    const channel = pusher.subscribe("projects");

    channel.bind("project-created", ({ project }: any) => {
      queryClient.setQueryData(["projects", workspaceId], (old: any) => {
        if (!old) return old;
        const alreadyExists = old.documents.find((p: any) => p.$id === project.$id);
        if (alreadyExists) return old;
        return {
          ...old,
          documents: [project, ...old.documents],
        };
      });
    });

    channel.bind("project-updated", ({ project }: any) => {
      queryClient.setQueryData(["projects", workspaceId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          documents: old.documents.map((p: any) =>
            p.$id === project.$id ? project : p
          ),
        };
      });

      queryClient.setQueryData(["project", project.$id], project);
    });

    channel.bind("project-deleted", ({ projectId }: any) => {
      queryClient.setQueryData(["projects", workspaceId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          documents: old.documents.filter((p: any) => p.$id !== projectId),
        };
      });

      queryClient.removeQueries({ queryKey: ["project", projectId] });
    });

    return () => {
      pusher.unsubscribe("projects");
      pusher.disconnect();
    };
  }, [workspaceId, queryClient]);
};
