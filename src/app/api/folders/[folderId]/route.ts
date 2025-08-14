import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID } from "@/config";

export async function PUT(
  request: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const { folderId } = params;
    const body = await request.json();
    const { name, color } = body;

    if (!name && !color) {
      return NextResponse.json({ error: "At least one field to update is required" }, { status: 400 });
    }

    const { databases } = await createAdminClient();
    
    const updates: any = {};
    if (name) updates.name = name;
    if (color) updates.color = color;

    const folder = await databases.updateDocument(
      DATABASE_ID,
      "folders",
      folderId,
      updates
    );

    return NextResponse.json(folder);
  } catch (error: any) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { folderId: string } }
) {
  try {
    const { folderId } = params;

    const { databases } = await createAdminClient();
    
    await databases.deleteDocument(
      DATABASE_ID,
      "folders",
      folderId
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
} 