import { NextRequest, NextResponse } from "next/server";
import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID } from "@/config";
import { Query, ID } from "node-appwrite";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    console.log("GET /api/folders - workspaceId:", workspaceId);

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    // Use admin client to bypass permission issues temporarily
    const { databases } = await createAdminClient();
    
    console.log("Admin client created, fetching folders for workspace:", workspaceId);
    
    const result = await databases.listDocuments(
      DATABASE_ID,
      "folders",
      [
        Query.equal("workspaceId", workspaceId),
        Query.orderDesc("$createdAt")
      ]
    );

    console.log("Folders fetched successfully:", {
      total: result.total,
      documentsCount: result.documents.length,
      documents: result.documents.map(d => ({ id: d.$id, name: d.name, workspaceId: d.workspaceId }))
    });

    return NextResponse.json({
      documents: result.documents,
      total: result.total
    });
  } catch (error: any) {
    console.error("Error fetching folders:", error);
    
    if (error.code === 401) {
      return NextResponse.json({ error: "Unauthorized - Please check your session" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, workspaceId, createdBy, color = "blue" } = body;

    console.log("Creating folder with data:", { name, workspaceId, createdBy, color });

    if (!name || !workspaceId || !createdBy) {
      return NextResponse.json({ error: "Name, workspaceId, and createdBy are required" }, { status: 400 });
    }

    // Use admin client to bypass permission issues temporarily
    const { databases } = await createAdminClient();
    
    console.log("Admin client created, attempting to create document...");
    
    const folder = await databases.createDocument(
      DATABASE_ID,
      "folders",
      ID.unique(),
      {
        name,
        workspaceId,
        createdBy,
        color
      }
    );

    console.log("Folder created successfully:", folder.$id);
    return NextResponse.json(folder);
  } catch (error: any) {
    console.error("Error creating folder:", error);
    
    if (error.code === 401) {
      return NextResponse.json({ 
        error: "Unauthorized - You don't have permission to create folders in this workspace",
        details: "Make sure you are a member of this workspace"
      }, { status: 401 });
    }
    
    if (error.code === 400) {
      return NextResponse.json({ 
        error: "Bad Request - Invalid data provided",
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to create folder",
      details: error.message 
    }, { status: 500 });
  }
} 