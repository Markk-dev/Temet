import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, FILES_ID, IMAGES_BUCKET_ID } from "@/config";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    const { databases, storage } = await createAdminClient();

    // Get the file record to find the storage file ID
    const fileRecord = await databases.getDocument(
      DATABASE_ID,
      FILES_ID,
      fileId
    );

    // Get the actual file content from storage
    const fileBuffer = await storage.getFileView(
      IMAGES_BUCKET_ID,
      fileRecord.fileId
    );

    // Convert to Buffer for proper binary handling
    const buffer = Buffer.from(fileBuffer);

    // Return the file as a stream with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fileRecord.mimeType,
        'Content-Disposition': `attachment; filename="${fileRecord.name}"`,
        'Content-Length': fileRecord.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error("Error downloading file:", error);
    
    if (error.code === 404) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: "Failed to download file",
      details: error.message 
    }, { status: 500 });
  }
} 