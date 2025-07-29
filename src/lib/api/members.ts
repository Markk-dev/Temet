import { getCurrent } from "@/features/auth/queries";
import { createSessionClient } from "@/lib/appwrite";
import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query } from "node-appwrite";

export async function getCurrentMember(headers?: Headers) {
  try {
    const user = await getCurrent();
    if (!user) return null;

    const { databases } = await createSessionClient();
    
    // Find the member document for this user
    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [Query.equal("userId", user.$id)]
    );

    if (members.documents.length === 0) {
      return null;
    }

    return members.documents[0];
  } catch (error) {
    console.error("Error getting current member:", error);
    return null;
  }
}

export async function getCurrentMemberInWorkspace(workspaceId: string) {
  try {
    const user = await getCurrent();
    if (!user) return null;

    const { databases } = await createSessionClient();
    
    // Find the member document for this user in the specific workspace
    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID,
      [
        Query.equal("userId", user.$id),
        Query.equal("workspaceId", workspaceId)
      ]
    );

    if (members.documents.length === 0) {
      return null;
    }

    return members.documents[0];
  } catch (error) {
    console.error("Error getting current member in workspace:", error);
    return null;
  }
} 