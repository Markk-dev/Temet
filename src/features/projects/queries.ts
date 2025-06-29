
import { Project } from "./types";
import { DATABASE_ID, PROJECTS_ID } from "@/config";

import { getMembers } from "@/features/members/utils";
import { createSessionClient } from "@/lib/appwrite";

interface getProjectProps {
    projectId: string;
  };
  
  
  export const getProject = async ({projectId}: getProjectProps) => {

        const { databases, account } = await createSessionClient();
        const user = await account.get();

        const project = await databases.getDocument<Project>(
          DATABASE_ID,
          PROJECTS_ID,
          projectId,
        );
        
        const member = await getMembers({
          databases,
          userId: user.$id,
          workspaceId: project.workspaceId,
        });
  
        if(!member){
          throw new Error("Unauthorized");
        }
        
          return project;
  };