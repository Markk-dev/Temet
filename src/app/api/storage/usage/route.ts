import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID } from "@/config";
import { getCurrentStorageLimit, getCurrentPlanName } from "@/config/storage";

export async function GET(request: NextRequest) {
  try {
    const { databases } = await createAdminClient();
    
    // Get all file records from the database to calculate current usage
    const files = await databases.listDocuments(
      DATABASE_ID,
      "files",
      []
    );
    
    // Calculate total size used from database records
    const totalSizeUsed = files.documents.reduce((sum: number, file: any) => sum + (file.size || 0), 0);
    
    // Get the current storage limit from configuration
    const bucketSizeLimit = getCurrentStorageLimit();
    
    const percentage = Math.round((totalSizeUsed / bucketSizeLimit) * 100);
    
    return NextResponse.json({
      used: totalSizeUsed,
      total: bucketSizeLimit,
      percentage: Math.min(percentage, 100),
      fileCount: files.total,
      planName: getCurrentPlanName(),
    });
  } catch (error: any) {
    console.error("Error fetching storage usage:", error);
    
    return NextResponse.json({ 
      error: "Failed to fetch storage usage",
      details: error.message 
    }, { status: 500 });
  }
} 