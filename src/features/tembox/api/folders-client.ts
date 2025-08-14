export interface Folder {
  $id: string;
  name: string;
  workspaceId: string;
  createdBy: string;
  color?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface CreateFolderParams {
  name: string;
  workspaceId: string;
  createdBy: string;
  color?: string;
}

export interface GetFoldersParams {
  workspaceId: string;
}

// Create a new folder
export async function createFolder({
  name,
  workspaceId,
  createdBy,
  color = "blue"
}: CreateFolderParams): Promise<Folder> {
  const response = await fetch("/api/folders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      workspaceId,
      createdBy,
      color
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create folder: ${response.status}`);
  }

  return response.json();
}

// Get folders for a workspace
export async function getFolders({ workspaceId }: GetFoldersParams): Promise<{ documents: Folder[]; total: number }> {
  const response = await fetch(`/api/folders?workspaceId=${workspaceId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch folders: ${response.status}`);
  }

  return response.json();
}

// Delete a folder
export async function deleteFolder(folderId: string): Promise<void> {
  const response = await fetch(`/api/folders/${folderId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete folder: ${response.status}`);
  }
}

// Update a folder
export async function updateFolder(
  folderId: string, 
  updates: Partial<Pick<Folder, 'name' | 'color'>>
): Promise<Folder> {
  const response = await fetch(`/api/folders/${folderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update folder: ${response.status}`);
  }

  return response.json();
} 