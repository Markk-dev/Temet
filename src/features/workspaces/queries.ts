"use server";

import { createSessionClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

import { Workspace } from "./types";
import { getMembers } from "@/features/members/utils";

import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

export const getWorkspaces = async () => {
    try {
        const { databases, account } = await createSessionClient();

        const user = await account.get();

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal('userId', user.$id)]
          );
    
          if(members.total === 0 ) {
            return { documents: [], total: 0};
          }
    
          const workspaceIds = members.documents.map((member) => member.workspaceId);
    
          const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
              Query.orderDesc("$createdAt"),
              Query.contains("$id", workspaceIds)
            ],
          );

          return workspaces;
    } catch {
        return { documents: [], total: 0};
    }
};

interface getWorkspaceProps {
  workspaceId: string;
};


export const getWorkspace = async ({workspaceId}: getWorkspaceProps) => {
  try {
      
      const { databases, account } = await createSessionClient();
      const user = await account.get();
      const member = await getMembers({
        databases,
        userId: user.$id,
        workspaceId,
      });

      if(!member){
        return null;
      }
      
        const workspaces = await databases.getDocument<Workspace>(
          DATABASE_ID,
          WORKSPACES_ID,
          workspaceId,
        );

        return workspaces;
  } catch {
      return null;
  }
};
