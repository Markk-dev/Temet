import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";

const CanvasPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Canvas</h1>
          <p className="text-muted-foreground mb-6">
            Create and collaborate on designs in real-time
          </p>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Canvas functionality will be available here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasPage;