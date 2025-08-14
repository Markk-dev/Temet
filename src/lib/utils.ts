import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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