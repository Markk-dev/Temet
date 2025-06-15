// types/index.ts or types/api-types.ts
export type workspace = {
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    name: string;
    userId: string;
    imageUrl?: string;
    inviteCode: string;
    [key: string]: any; 
};
  