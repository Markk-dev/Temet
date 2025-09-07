import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { CanvasPermissionGuard } from "@/features/canvas/components/canvas-permission-guard";

interface CanvasRoomPageProps {
  params: {
    workspaceId: string;
    roomId: string;
  };
}

const CanvasRoomPage = async ({ params }: CanvasRoomPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const { workspaceId, roomId } = params;

  return (
    <CanvasPermissionGuard
      roomId={roomId}
      requiredPermission="canView"
      fallback={
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to view this canvas room.
            </p>
          </div>
        </div>
      }
      loading={
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading canvas room...</p>
          </div>
        </div>
      }
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Canvas Room</h1>
            <p className="text-muted-foreground mb-6">
              Workspace: {workspaceId} | Room: {roomId}
            </p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Canvas room functionality will be available here
              </p>
            </div>
          </div>
        </div>
      </div>
    </CanvasPermissionGuard>
  );
};

export default CanvasRoomPage;