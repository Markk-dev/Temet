import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID } from "@/config";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    console.log("Deleting file:", fileId);

    const { databases, storage } = await createAdminClient();

    // First, get the file record to find the storage file ID
    const fileRecord = await databases.getDocument(
      DATABASE_ID,
      "files",
      fileId
    );

    console.log("File record found:", fileRecord.$id, "Storage file ID:", fileRecord.fileId);

    // Delete the file from storage
    await storage.deleteFile(
      '684af449000b14ce963b', // bucket ID
      fileRecord.fileId
    );
    console.log("File deleted from storage");

    // Delete the file record from database
    await databases.deleteDocument(
      DATABASE_ID,
      "files",
      fileId
    );
    console.log("File record deleted from database");

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