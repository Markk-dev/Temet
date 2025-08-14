import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { useCurrent } from "@/features/auth/api/use-current";
import { 
  createFolder, 
  getFolders, 
  deleteFolder, 
  updateFolder,
  type CreateFolderParams,
  type Folder 
} from "../api/folders-client";

export const useGetFolders = () => {
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();

  return useQuery({
    queryKey: ['folders', workspaceId],
    queryFn: () => getFolders({ workspaceId: workspaceId! }),
    enabled: !!workspaceId && !!user,
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();

  return useMutation({
    mutationFn: (data: Omit<CreateFolderParams, 'workspaceId' | 'createdBy'>) => {
      if (!workspaceId || !user) {
        throw new Error("Workspace ID and user are required");
      }
      
      return createFolder({
        ...data,
        workspaceId,
        createdBy: user.$id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", workspaceId] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", workspaceId] });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  return useMutation({
    mutationFn: ({ folderId, updates }: { folderId: string; updates: Partial<Pick<Folder, 'name' | 'color'>> }) => {
      return updateFolder(folderId, updates);
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["folders", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["files", workspaceId] });
    },
  });
}; 