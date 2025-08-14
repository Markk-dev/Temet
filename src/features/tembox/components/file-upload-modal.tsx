"use client"

import { useState } from "react";
import { useMedia } from "react-use";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  X, 
  Image, 
  FileText, 
  Video, 
  File, 
  Folder,
  Check,
  Loader2
} from "lucide-react";
import { useFileUploadModal } from "../hooks/use-file-upload-modal";
import { useGetFolders } from "../hooks/use-folders";
import { useUploadFile } from "../hooks/use-files";
import { toast } from "sonner";

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return { icon: Image, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  } else if (fileType.startsWith('video/')) {
    return { icon: Video, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" };
  } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
    return { icon: FileText, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
  } else {
    return { icon: File, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUploadModal = () => {
  const { isOpen, close, selectedFile } = useFileUploadModal();
  const { data: foldersData } = useGetFolders();
  const uploadFileMutation = useUploadFile();
  const isOnDesktop = useMedia("(min-width: 1024px)", true);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  const handleUpload = async () => {
    if (!selectedFile || !selectedFolderId) {
      toast.error("Please select a folder to upload the file to");
      return;
    }

    try {
      await uploadFileMutation.mutateAsync({
        file: selectedFile.file,
        folderId: selectedFolderId
      });
      
      toast.success("File uploaded successfully!");
      close();
      setSelectedFolderId("");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Failed to upload file. Please try again.");
    }
  };

  const handleClose = () => {
    setSelectedFolderId("");
    close();
  };

  const truncateFileName = (fileName: string, maxLength: number = 50) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExtension.substring(0, maxLength - 3);
    return `${truncatedName}...${extension ? '.' + extension : ''}`;
  };

  if (!selectedFile) return null;

  const fileInfo = selectedFile.file;
  const fileIcon = getFileIcon(fileInfo.type);
  const IconComponent = fileIcon.icon;
  const isLoading = uploadFileMutation.isPending;

  const content = (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <Upload className="size-6 text-blue-600"/>
          <CardTitle className="text-xl font-bold text-gray-900">
            Upload File
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* File Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              File to Upload
            </Label>
            <div className={`border rounded-lg p-4 ${fileIcon.bg} ${fileIcon.border}`}>
              <div className="flex items-center gap-3">
                <IconComponent className={`size-8 ${fileIcon.color}`}/>
                <div className="flex-1">
                  <div className="font-semibold text-gray-700">{truncateFileName(fileInfo.name)}</div>
                  <div className="text-sm text-gray-500">{formatFileSize(fileInfo.size)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Folder Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Select Folder
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {foldersData?.documents && foldersData.documents.length > 0 ? (
                foldersData.documents.map((folder) => (
                  <button
                    key={folder.$id}
                    onClick={() => setSelectedFolderId(folder.$id)}
                    disabled={isLoading}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedFolderId === folder.$id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Folder className="size-5 text-blue-600"/>
                        <span className="font-medium text-gray-700">{folder.name}</span>
                      </div>
                      {selectedFolderId === folder.$id && (
                        <Check className="size-5 text-blue-600"/>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Folder className="size-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No folders available</p>
                  <p className="text-xs text-gray-400 mt-1">Create a folder first to upload files</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFolderId || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload File"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isOnDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="w-full sm:max-w-md p-0 border-none overflow-y-auto hide-scrollbar max-h-[75vh]">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={close}>
      <DrawerContent>
        <div className="overflow-y-auto hide-scrollbar max-h-[75vh]">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );
}; 