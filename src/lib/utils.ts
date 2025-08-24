import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Query } from "node-appwrite";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getFileViewUrl = (fileId: string): string => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  if (!endpoint || !projectId) {
    throw new Error("Missing Appwrite config");
  }

  return `${endpoint}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID}/files/${fileId}/view?project=${projectId}`;
};

export function generateInviteCode(length: number){
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
}

export function snakeCaseToTitleCase(str: string){
  return str.toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
};

export function snakeToEnumStatus(str: string) {
  return str?.toUpperCase();
}


export function extractFileIdFromUrl(url: string): string | null {
  
  const match = url.match(/\/files\/([^/]+)\/view/);
  return match ? match[1] : null;
}

/**
 * Batch fetch users to avoid N+1 queries
 * @param userIds Array of user IDs to fetch
 * @param usersService Appwrite users service instance
 * @returns Map of userId -> user data
 */
export async function batchFetchUsers(
  userIds: string[], 
  usersService: any
): Promise<Map<string, any>> {
  const uniqueUserIds = [...new Set(userIds)];
  const usersMap = new Map();
  
  if (uniqueUserIds.length === 0) {
    return usersMap;
  }
  
  // Get all users in parallel
  const userPromises = uniqueUserIds.map(async (userId) => {
    try {
      const user = await usersService.get(userId);
      return [userId, user];
    } catch (error) {
      // Failed to fetch user silently
      return null;
    }
  });
  
  const userResults = await Promise.allSettled(userPromises);
  const validResults = userResults
      .filter((result): result is PromiseFulfilledResult<[string, any]> => 
          result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  
  validResults.forEach(([userId, user]) => {
      usersMap.set(userId, user);
  });
  
  return usersMap;
}

/**
 * Batch fetch documents by IDs to avoid N+1 queries
 * @param documentIds Array of document IDs to fetch
 * @param databasesService Appwrite databases service instance
 * @param databaseId Database ID
 * @param collectionId Collection ID
 * @returns Map of documentId -> document data
 */
export async function batchFetchDocuments(
  documentIds: string[],
  databasesService: any,
  databaseId: string,
  collectionId: string
): Promise<Map<string, any>> {
  const uniqueIds = [...new Set(documentIds)];
  const documentsMap = new Map();
  
  if (uniqueIds.length === 0) {
    return documentsMap;
  }
  
  try {
    // Use contains query to get all documents in one request
    const result = await databasesService.listDocuments(
      databaseId,
      collectionId,
      [Query.contains("$id", uniqueIds)]
    );
    
    result.documents.forEach((doc: any) => {
      documentsMap.set(doc.$id, doc);
    });
  } catch (error) {
    // Failed to batch fetch documents silently
    return new Map();
  }
  
  return documentsMap;
}