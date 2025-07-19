import Pusher from "pusher-js";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

export function usePusherSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Listen for workspace events
    const workspaces = pusher.subscribe("workspaces");
    workspaces.bind("workspace-created", () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }));
    workspaces.bind("workspace-updated", () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }));
    workspaces.bind("workspace-deleted", () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }));
    workspaces.bind("workspace-invite-reset", () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }));
    workspaces.bind("workspace-joined", () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }));

    // Listen for task events
    const tasks = pusher.subscribe("tasks");
    tasks.bind("task-created", () => queryClient.invalidateQueries({ queryKey: ["tasks"] }));
    tasks.bind("task-updated", () => queryClient.invalidateQueries({ queryKey: ["tasks"] }));
    tasks.bind("task-deleted", () => queryClient.invalidateQueries({ queryKey: ["tasks"] }));
    tasks.bind("tasks-bulk-updated", () => queryClient.invalidateQueries({ queryKey: ["tasks"] }));

    // Listen for project events
    const projects = pusher.subscribe("projects");
    projects.bind("project-created", () => queryClient.invalidateQueries({ queryKey: ["projects"] }));
    projects.bind("project-updated", () => queryClient.invalidateQueries({ queryKey: ["projects"] }));
    projects.bind("project-deleted", () => queryClient.invalidateQueries({ queryKey: ["projects"] }));

    // Listen for member events
    const members = pusher.subscribe("members");
    members.bind("member-updated", () => queryClient.invalidateQueries({ queryKey: ["members"] }));
    members.bind("member-deleted", () => queryClient.invalidateQueries({ queryKey: ["members"] }));

    return () => {
      workspaces.unbind_all();
      pusher.unsubscribe("workspaces");
      tasks.unbind_all();
      pusher.unsubscribe("tasks");
      projects.unbind_all();
      pusher.unsubscribe("projects");
      members.unbind_all();
      pusher.unsubscribe("members");
      pusher.disconnect();
    };
  }, [queryClient]);
}
