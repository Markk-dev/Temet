import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, FILES_ID, IMAGES_BUCKET_ID } from "@/config";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    const { databases, storage } = await createAdminClient();

    // First, get the file record to find the storage file ID
    const fileRecord = await databases.getDocument(
      DATABASE_ID,
      FILES_ID,
      fileId
    );

    // Delete the file from storage
    await storage.deleteFile(
      IMAGES_BUCKET_ID,
      fileRecord.fileId
    );

    // Delete the file record from database
    await databases.deleteDocument(
      DATABASE_ID,
      FILES_ID,
      fileId
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    
    if (error.code === 404) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: "Failed to delete file",
      details: error.message 
    }, { status: 500 });
  }
} 