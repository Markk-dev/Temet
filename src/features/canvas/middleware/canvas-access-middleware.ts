import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite";
import { validateCanvasRoomAccess } from "../utils";
import { CanvasPermission } from "../types";

export interface CanvasAccessConfig {
  requiredPermission: keyof CanvasPermission;
  redirectUrl?: string;
}

export const withCanvasAccess = (config: CanvasAccessConfig) => {
  return async (
    request: NextRequest,
    context: { params: { roomId: string } }
  ) => {
    try {
      const { databases, account } = await createSessionClient();
      const user = await account.get();
      const { roomId } = context.params;

      const hasAccess = await validateCanvasRoomAccess({
        databases,
        roomId,
        userId: user.$id,
        requiredPermission: config.requiredPermission,
      });

      if (!hasAccess) {
        if (config.redirectUrl) {
          return NextResponse.redirect(new URL(config.redirectUrl, request.url));
        }
        return new NextResponse("Access Denied", { status: 403 });
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Canvas access middleware error:", error);
      
      if (config.redirectUrl) {
        return NextResponse.redirect(new URL(config.redirectUrl, request.url));
      }
      return new NextResponse("Unauthorized", { status: 401 });
    }
  };
};

// Predefined middleware configurations
export const canvasViewMiddleware = withCanvasAccess({
  requiredPermission: "canView",
  redirectUrl: "/unauthorized",
});

export const canvasEditMiddleware = withCanvasAccess({
  requiredPermission: "canEdit",
  redirectUrl: "/unauthorized",
});

export const canvasDeleteMiddleware = withCanvasAccess({
  requiredPermission: "canDelete",
  redirectUrl: "/unauthorized",
});

export const canvasInviteMiddleware = withCanvasAccess({
  requiredPermission: "canInvite",
  redirectUrl: "/unauthorized",
});