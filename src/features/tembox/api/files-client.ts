export interface FileRecord {
  $id: string;
  name: string;
  workspaceId: string;
  folderId?: string;
  fileId: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface UploadFileParams {
  file: File;
  workspaceId: string;
  uploadedBy: string;
  folderId?: string;
}

export interface GetFilesParams {
  workspaceId: string;
  folderId?: string;
}

// Upload a file
export async function uploadFile({
  file,
  workspaceId,
  uploadedBy,
  folderId
}: UploadFileParams): Promise<{ file: any; record: FileRecord }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('workspaceId', workspaceId);
  formData.append('uploadedBy', uploadedBy);
  if (folderId) {
    formData.append('folderId', folderId);
  }

  const response = await fetch("/api/files", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to upload file: ${response.status}`);
  }

  return response.json();
}

// Get files for a workspace or folder
export async function getFiles({ workspaceId, folderId }: GetFilesParams): Promise<{ documents: FileRecord[]; total: number }> {
  const params = new URLSearchParams({ workspaceId });
  if (folderId) {
    params.append('folderId', folderId);
  }

  const response = await fetch(`/api/files?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch files: ${response.status}`);
  }

  return response.json();
}

// Delete a file
export async function deleteFile(fileId: string): Promise<void> {
  const response = await fetch(`/api/files/${fileId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete file: ${response.status}`);
  }
} 

export async function downloadFile(fileId: string): Promise<Blob> {
  const response = await fetch(`/api/files/${fileId}/download`, {
    method: "GET",
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to download file: ${response.status}`);
  }
  
  return response.blob();
} 