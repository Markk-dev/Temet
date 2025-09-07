import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite";
import { validateCanvasRoomAccess } from "../utils";
import { CanvasPermission } from "../types";

export interface CanvasRouteConfig {
  requiredPermission: keyof CanvasPermission;
  redirectUrl?: string;
}

/**
 * Middleware for protecting canvas routes with permission checks
 */
export const createCanvasRouteMiddleware = (config: CanvasRouteConfig) => {
  return async (request: NextRequest) => {
    try {
      const { databases, account } = await createSessionClient();
      const user = await account.get();
      
      // Extract roomId from URL path
      const url = new URL(request.url);
      const pathSegments = url.pathname.split('/');
      const canvasIndex = pathSegments.findIndex(segment => segment === 'canvas');
      const roomId = pathSegments[canvasIndex + 1];

      if (!roomId) {
        // If no roomId in path, allow access (might be canvas list page)
        return NextResponse.next();
      }

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
      console.error("Canvas route middleware error:", error);
      
      if (config.redirectUrl) {
        return NextResponse.redirect(new URL(config.redirectUrl, request.url));
      }
      return new NextResponse("Unauthorized", { status: 401 });
    }
  };
};

// Predefined middleware configurations for different permission levels
export const canvasViewRouteMiddleware = createCanvasRouteMiddleware({
  requiredPermission: "canView",
  redirectUrl: "/unauthorized",
});

export const canvasEditRouteMiddleware = createCanvasRouteMiddleware({
  requiredPermission: "canEdit",
  redirectUrl: "/unauthorized",
});

export const canvasDeleteRouteMiddleware = createCanvasRouteMiddleware({
  requiredPermission: "canDelete",
  redirectUrl: "/unauthorized",
});

export const canvasInviteRouteMiddleware = createCanvasRouteMiddleware({
  requiredPermission: "canInvite",
  redirectUrl: "/unauthorized",
});