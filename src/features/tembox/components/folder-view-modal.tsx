"use client"

import React from "react";
import { useMedia } from "react-use";
import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Folder, Upload, Search, File, Image, FileText, Video, Loader2, MoreVertical, Download, Trash2, X, Edit } from "lucide-react";
import { useFolderViewModal } from "../hooks/use-folder-view-modal";
import { useTemboxModal } from "../hooks/use-tembox-modal";
import { useFileUploadModal } from "../hooks/use-file-upload-modal";
import { useUpdateFolderModal } from "../hooks/use-update-folder-modal";
import { useGetFiles } from "../hooks/use-files";
import { useDeleteFile } from "../hooks/use-files";
import { useDeleteFolder, useUpdateFolder } from "../hooks/use-folders";
import { downloadFile } from "../api/files-client";
import { DottedSeparator } from "@/components/dotted-line";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

// Custom DialogContent without close button
const DialogContentNoClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContentNoClose.displayName = DialogPrimitive.Content.displayName;

export const FolderViewModal = () => {
  const { isOpen, close, selectedFolder } = useFolderViewModal();
  const { open: openStorageModal } = useTemboxModal();
  const { open: openFileUpload } = useFileUploadModal();
  const { open: openUpdateFolderModal } = useUpdateFolderModal();
  const { data: filesData, isLoading: isLoadingFiles } = useGetFiles(selectedFolder?.folderId);
  const deleteFileMutation = useDeleteFile();
  const deleteFolderMutation = useDeleteFolder();
  const updateFolderMutation = useUpdateFolder();
  const isOnDesktop = useMedia("(min-width: 1024px)", true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim() || !filesData?.documents) {
      return filesData?.documents || [];
    }
    
    const query = searchQuery.toLowerCase();
    return filesData.documents.filter((file: any) =>
      file.name.toLowerCase().includes(query)
    );
  }, [filesData?.documents, searchQuery]);

  const hasSearchResults = searchQuery.trim() && filteredFiles.length > 0;
  const hasNoResults = searchQuery.trim() && filteredFiles.length === 0;

  const handleBack = () => {
    close();
    openStorageModal();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRenameFolder = () => {
    if (!selectedFolder?.folderId) return;
    
    openUpdateFolderModal({
      folderId: selectedFolder.folderId,
      folderName: selectedFolder.folderName,
      folderColor: selectedFolder.folderColor || 'blue'
    });
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder?.folderId) return;
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFolder = async () => {
    if (!selectedFolder?.folderId) return;

    try {
      await deleteFolderMutation.mutateAsync(selectedFolder.folderId);
      toast.success(`"${selectedFolder.folderName}" deleted successfully`);
      setShowDeleteConfirm(false);
      close();
      openStorageModal();
    } catch (error: any) {
      console.error("Error deleting folder:", error);
      toast.error(error.message || "Failed to delete folder");
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      await deleteFileMutation.mutateAsync(fileId);
      toast.success(`"${fileName}" deleted successfully`);
    } catch (error: any) {
      console.error("Error deleting file:", error);
      toast.error(error.message || "Failed to delete file");
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const blob = await downloadFile(fileId);
      
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(blobUrl);
      
      toast.success(`"${fileName}" download started`);
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      
      const maxSize = 50 * 1024 * 1024; 
      if (file.size > maxSize) {
        toast.error(`File size too large. Maximum allowed size is 50MB.`);
        return;
      }
      
      const allowedExtensions = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff',
        'pdf', 'txt', 'rtf', 'md',
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v',
        'zip', 'rar', '7z', 'tar', 'gz',
        'json', 'xml', 'csv', 'html', 'css', 'js', 'ts'
      ];
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        toast.error(`File type not supported. Please upload a supported file type.`);
        return;
      }
      
      openFileUpload(file, selectedFolder?.folderId);
    }
    
    e.target.value = '';
  };

  const getFolderColorClasses = (color: string) => {
    const colors = {
      blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" },
      green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" },
      purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600" },
      orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600" },
      red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600" },
      gray: { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600" },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const colorClasses = selectedFolder ? getFolderColorClasses(selectedFolder.folderColor || 'blue') : getFolderColorClasses('blue');

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

  const truncateFileName = (fileName: string, maxLength: number = 50) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExtension.substring(0, maxLength - 3);
    return `${truncatedName}...${extension ? '.' + extension : ''}`;
  };

  const content = (
    <Card className="w-full h-full border-none shadow-none flex flex-col">
      <CardHeader className="p-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClasses.bg} ${colorClasses.border}`}>
                <Folder className={`size-6 ${colorClasses.icon}`} />
              </div>
              <div className="flex flex-col gap-y-1.5 pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {selectedFolder?.folderName || "Folder"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  View and manage files in this folder
                </p>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRenameFolder}>
                <Edit className="mr-2 h-4 w-4" />
                Update Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteFolder} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <DottedSeparator/>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-6 flex-1">
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Search Input */}
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search files in this folder..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg outline-none placeholder-gray-400 placeholder:text-xs w-64 h-9"
                autoComplete="off"
              />
              {searchQuery.trim() ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <Search className="absolute right-3 size-4 text-gray-400" />
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="size-4"/>
              Upload Files
            </Button>
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              multiple={false}
            />
          </div>

          {/* Files Section */}
          <div className="space-y-4 flex-1 flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 flex-shrink-0">
              {searchQuery.trim() ? `Search Results (${filteredFiles.length})` : `Files (${filesData?.documents?.length || 0})`}
            </h3>
            
            {/* Loading State */}
            {isLoadingFiles ? (
              <div className="flex items-center justify-center py-16 text-gray-500 flex-1">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-sm">Loading files...</p>
                </div>
              </div>
            ) : hasNoResults ? (
              <div className="text-center py-16 text-gray-500 flex-1">
                <Search className="size-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No files found for "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
              </div>
            ) : filteredFiles.length > 0 ? (
              <div className="space-y-3 flex-1">
                {filteredFiles.map((file) => {
                  const fileIcon = getFileIcon(file.mimeType);
                  const IconComponent = fileIcon.icon;
                  return (
                    <div
                      key={file.$id}
                      className={`border rounded-lg p-4 ${fileIcon.bg} ${fileIcon.border} hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`size-8 ${fileIcon.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-700 truncate text-sm">{truncateFileName(file.name)}</div>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {new Date(file.$createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadFile(file.$id, file.name)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteFile(file.$id, file.name)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 flex-1 flex items-center justify-center">
                <div>
                  <File className="size-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No files in this folder yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload your first file to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isOnDesktop) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={close}>
          <DialogContentNoClose className="w-full sm:max-w-lg lg:max-w-xl p-0 border-none overflow-y-auto hide-scrollbar max-h-[95vh]">
            {content}
          </DialogContentNoClose>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-md">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-red-100">
                  <Trash2 className="size-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Delete Folder</h3>
                  <p className="text-xs text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-semibold">"{selectedFolder?.folderName}"</span>? 
                This will also delete all files inside the folder.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="deletion"
                  size="sm"
                  onClick={confirmDeleteFolder}
                  disabled={deleteFolderMutation.isPending}
                >
                  {deleteFolderMutation.isPending ? "Deleting..." : "Delete Folder"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Drawer open={isOpen} onOpenChange={close}>
        <DrawerContent>
          <div className="overflow-y-auto hide-scrollbar max-h-[95vh]">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContentNoClose className="sm:max-w-md">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 className="size-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Folder</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">"{selectedFolder?.folderName}"</span>? 
              This will also delete all files inside the folder.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="deletion"
                size="sm"
                onClick={confirmDeleteFolder}
                disabled={deleteFolderMutation.isPending}
              >
                {deleteFolderMutation.isPending ? "Deleting..." : "Delete Folder"}
              </Button>
            </div>
          </div>
        </DialogContentNoClose>
      </Dialog>
    </>
  );
}; 