"use client"

import { useState, useCallback, useMemo } from "react";
import { GrUpload } from "react-icons/gr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-line";
import { Button } from "@/components/ui/button";
import { Search, FolderPlus, Folder, Upload, File, X } from "lucide-react";
import { useCreateFolderModal } from "../hooks/use-create-folder-modal";
import { useGetFolders } from "../hooks/use-folders";
import { useGetFiles } from "../hooks/use-files";
import { useFolderViewModal } from "../hooks/use-folder-view-modal";
import { useTemboxModal } from "../hooks/use-tembox-modal";
import { useFileUploadModal } from "../hooks/use-file-upload-modal";
import { useStorageUsage } from "../hooks/use-storage-usage";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TemBoxContentProps {
    onCancel?: () => void;
}

const getFolderColorClasses = (color: string) => {
    const colors = {
        blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", hover: "hover:bg-blue-100" },
        green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", hover: "hover:bg-green-100" },
        purple: { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", hover: "hover:bg-purple-100" },
        orange: { bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600", hover: "hover:bg-orange-100" },
        red: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", hover: "hover:bg-red-100" },
        gray: { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600", hover: "hover:bg-gray-100" },
    };
    return colors[color as keyof typeof colors] || colors.blue;
};


const FolderCard = ({ folder }: { folder: any }) => {
    const { data: filesData } = useGetFiles(folder.$id);
    const { open: openFolderView, close: closeStorageModal } = useFolderViewModal();
    const { close: closeTemboxModal } = useTemboxModal();
    
    const colorClasses = getFolderColorClasses(folder.color || 'blue');
    
    const handleFolderClick = () => {
        closeTemboxModal();
        openFolderView({
            folderId: folder.$id,
            folderName: folder.name,
            folderColor: folder.color
        });
    };

    return (
        <div 
            className={`border rounded-lg p-2 sm:p-4 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover} cursor-pointer transition-colors`}
            onClick={handleFolderClick}
        >
            <div className="flex items-center gap-2 sm:gap-3">
                <Folder className={`size-4 sm:size-6 ${colorClasses.icon}`}/>
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-gray-700 text-xs sm:text-sm truncate">{folder.name}</div>
                    <div className="text-xs text-gray-500">
                        {filesData?.documents?.length || 0} items
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TemBoxContent = ({ onCancel }: TemBoxContentProps) => {
    const { open: openCreateFolder } = useCreateFolderModal();
    const { open: openFolderView, close: closeStorageModal } = useFolderViewModal();
    const { close: closeTemboxModal } = useTemboxModal();
    const { open: openFileUpload } = useFileUploadModal();
    const { data: foldersData, isLoading: isLoadingFolders, error } = useGetFolders();
    const { data: filesData } = useGetFiles(); // Get all files for search
    const { data: storageUsage, isLoading: isLoadingStorage } = useStorageUsage();
    const [isDragOver, setIsDragOver] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter folders and files based on search query
    const filteredFolders = useMemo(() => {
        if (!searchQuery.trim() || !foldersData?.documents) {
            return foldersData?.documents || [];
        }
        
        const query = searchQuery.toLowerCase();
        return foldersData.documents.filter((folder: any) =>
            folder.name.toLowerCase().includes(query)
        );
    }, [foldersData?.documents, searchQuery]);

    const filteredFiles = useMemo(() => {
        if (!searchQuery.trim() || !filesData?.documents) {
            return [];
        }
        
        const query = searchQuery.toLowerCase();
        return filesData.documents.filter((file: any) =>
            file.name.toLowerCase().includes(query)
        );
    }, [filesData?.documents, searchQuery]);

    const hasSearchResults = searchQuery.trim() && (filteredFolders.length > 0 || filteredFiles.length > 0);
    const hasNoResults = searchQuery.trim() && filteredFolders.length === 0 && filteredFiles.length === 0;

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const file = files[0];
            
            const maxSize = 50 * 1024 * 1024; 
            if (file.size > maxSize) {
                toast.error(`File size too large. Maximum allowed size is 50MB.`);
                return;
            }
            
            
            if (file.size === 0) {
                toast.error(`File appears to be empty or corrupted.`);
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
            
            openFileUpload(file);
        }
    }, [openFileUpload]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const file = files[0];
            
            const maxSize = 50 * 1024 * 1024; 
            if (file.size > maxSize) {
                toast.error(`File size too large. Maximum allowed size is 50MB.`);
                return;
            }
            
            
            if (file.size === 0) {
                toast.error(`File appears to be empty or corrupted.`);
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
            
            openFileUpload(file);
            e.target.value = '';
        }
    }, [openFileUpload]);

    if (isLoadingFolders) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                Failed to load folders. Please try again.
            </div>
        );
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-6 pb-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Storage
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Manage your files and folders with drag & drop functionality
                    </p>
                </div>
            </CardHeader>
            <div className="px-6">
                <DottedSeparator/>
            </div>
            <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {/* Simple Search Bar */}
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search files and folders..."
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

                        {/* Other buttons */}
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-2 sm:gap-2"
                                onClick={openCreateFolder}
                            >
                                <FolderPlus className="size-4"/>
                                <span className="hidden sm:inline">New Folder</span>
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex items-center gap-2 sm:gap-2"
                                onClick={() => document.getElementById('storage-file-input')?.click()}
                            >
                                <Upload className="size-4"/>
                                <span className="hidden sm:inline">Upload Files</span>
                            </Button>
                            <input
                                id="storage-file-input"
                                type="file"
                                className="hidden"
                                onChange={handleFileSelect}
                                multiple={false}
                            />
                        </div>
                    </div>

                    {/* Upload Section */}
                    <div 
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            isDragOver 
                                ? "border-blue-500 bg-blue-50" 
                                : "border-blue-300 bg-blue-50/50"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <GrUpload className={`size-8 mx-auto mb-3 ${isDragOver ? "text-blue-600" : "text-muted-foreground"}`}/>
                        <h3 className={`text-sm font-medium ${isDragOver ? "text-blue-600" : "text-muted-foreground"}`}>
                            {isDragOver ? "Drop files here" : "Drop files here or click to upload"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">
                            Maximum file size: 50MB • Supports: Images, Documents, Office files, Videos, Archives
                        </p>
                    </div>

                    {/* Folders Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {searchQuery.trim() ? `Search Results for "${searchQuery}"` : "Folders"}
                        </h3>
                        
                        {isLoadingFolders ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                        ) : hasSearchResults ? (
                           
                            <div className="space-y-4">
                                {/* Folders in search results */}
                                {filteredFolders.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Folders ({filteredFolders.length})</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                            {filteredFolders.map((folder) => (
                                                <FolderCard key={folder.$id} folder={folder} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Files in search results */}
                                {filteredFiles.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Files ({filteredFiles.length})</h4>
                                        <div className="space-y-2">
                                            {filteredFiles.map((file) => (
                                                <div
                                                    key={file.$id}
                                                    className="border rounded-lg p-4 bg-gray-50 border-gray-200 hover:shadow-sm transition-shadow"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <File className="size-6 text-gray-600" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-gray-700 truncate text-sm">{file.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                {formatFileSize(file.size)} • {new Date(file.$createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : hasNoResults ? (
                           
                            <div className="text-center py-8 text-gray-500">
                                <Search className="size-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">No results found for "{searchQuery}"</p>
                                <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
                            </div>
                        ) : filteredFolders.length > 0 ? (
                           
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                                {filteredFolders.map((folder) => (
                                    <FolderCard key={folder.$id} folder={folder} />
                                ))}
                            </div>
                        ) : (
                           
                            <div className="text-center py-8 text-gray-500">
                                <Folder className="size-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">No folders created yet</p>
                                <p className="text-xs text-gray-400 mt-1">Create your first folder to get started</p>
                            </div>
                        )}
                    </div>

                    {/* Dotted Separator */}
                    <DottedSeparator/>

                    {/* Storage Usage Section */}
                    <div className="bg-blue-50 border border-dotted border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-medium text-blue-900 text-sm">Workspace Usage</h3>
                                {isLoadingStorage ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="size-3 animate-spin text-blue-600" />
                                        <p className="text-xs text-blue-700">Loading storage info...</p>
                                    </div>
                                ) : storageUsage ? (
                                    <p className="text-xs text-blue-700 truncate">
                                        {formatFileSize(storageUsage.used)} of {formatFileSize(storageUsage.total)} used
                                    </p>
                                ) : (
                                    <p className="text-xs text-blue-700">Unable to load storage info</p>
                                )}
                            </div>
                            <div className="flex flex-col sm:items-end gap-2 min-w-0 flex-shrink-0">
                                <div className="w-full sm:w-40 h-2 bg-blue-200 rounded-full overflow-hidden">
                                    {storageUsage && (
                                        <div 
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${storageUsage.percentage}%` }}
                                        ></div>
                                    )}
                                </div>
                                {isLoadingStorage ? (
                                    <p className="text-xs text-blue-600">Loading...</p>
                                ) : storageUsage ? (
                                    <p className="text-xs text-blue-600">{storageUsage.percentage}% used</p>
                                ) : (
                                    <p className="text-xs text-blue-600">--</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 