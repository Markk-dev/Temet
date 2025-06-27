import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";

type Props = {
  params: {
    workspaceId: string;
  };
};

export default async function WorkspaceSettingsPage({ params }: Props) {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const workspaceId = params.workspaceId;

  const initialValues = await getWorkspace({ workspaceId });

  if (!initialValues) {
    redirect(`/workspaces/${workspaceId}`);
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
}