import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { useCurrent } from "@/features/auth/api/use-current";
import { 
  uploadFile, 
  getFiles, 
  deleteFile,
  type UploadFileParams,
  type FileRecord 
} from "../api/files-client";

export const useGetFiles = (folderId?: string) => {
  const workspaceId = useWorkspaceId();
  
  return useQuery({
    queryKey: ["files", workspaceId, folderId],
    queryFn: () => getFiles({ workspaceId, folderId }),
    enabled: !!workspaceId,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();

  return useMutation({
    mutationFn: (data: Omit<UploadFileParams, 'workspaceId' | 'uploadedBy'>) => {
      if (!workspaceId || !user) {
        throw new Error("Workspace ID and user are required");
      }
      
      return uploadFile({
        ...data,
        workspaceId,
        uploadedBy: user.$id,
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate files queries for both the specific folder and general workspace
      queryClient.invalidateQueries({ queryKey: ["files", workspaceId, variables.folderId] });
      queryClient.invalidateQueries({ queryKey: ["files", workspaceId] });
      
      // Also invalidate folders to update the "Total items" count
      queryClient.invalidateQueries({ queryKey: ["folders", workspaceId] });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      // Invalidate all files queries
      queryClient.invalidateQueries({ queryKey: ["files", workspaceId] });
      // Also invalidate folders to update the "Total items" count
      queryClient.invalidateQueries({ queryKey: ["folders", workspaceId] });
    },
  });
}; 