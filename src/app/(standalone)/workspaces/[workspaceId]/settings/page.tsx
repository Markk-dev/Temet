import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { WorkspaceSettingsClient } from "./client";

export default async function WorkspaceSettingsPage() {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return <WorkspaceSettingsClient/>
}