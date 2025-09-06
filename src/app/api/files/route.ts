import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, IMAGES_BUCKET_ID } from "@/config";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workspaceId = formData.get('workspaceId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;
    const folderId = formData.get('folderId') as string;

    if (!file || !workspaceId || !uploadedBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { databases, storage } = await createAdminClient();

    // Upload file to storage
    const uploadedFile = await storage.createFile(
      IMAGES_BUCKET_ID,
      ID.unique(),
      file
    );

    const fileRecord = await databases.createDocument(
      DATABASE_ID,
      "files",
      ID.unique(),
      {
        name: file.name,
        workspaceId,
        folderId: folderId || null,
        fileId: uploadedFile.$id,
        mimeType: file.type,
        size: file.size,
        uploadedBy
      }
    );

    return NextResponse.json({
      file: uploadedFile,
      record: fileRecord
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    
    if (error.code === 400 && error.type === 'storage_invalid_file_size') {
      return NextResponse.json({ 
        error: "File size exceeds the allowed limit. Please check your bucket settings." 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: "Failed to upload file",
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const folderId = searchParams.get("folderId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const { databases } = await createAdminClient();
    
    const queries = [
      Query.equal("workspaceId", workspaceId),
      Query.orderDesc("$createdAt")
    ];

    if (folderId) {
      queries.push(Query.equal("folderId", folderId));
    }

    const result = await databases.listDocuments(
      DATABASE_ID,
      "files",
      queries
    );

    return NextResponse.json({
      documents: result.documents,
      total: result.total
    });
  } catch (error: any) {
    console.error("Error fetching files:", error);
    
    if (error.code === 401) {
      return NextResponse.json({ error: "Unauthorized - Please check your session" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
} 