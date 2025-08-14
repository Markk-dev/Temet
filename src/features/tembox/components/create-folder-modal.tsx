"use client"

import { useState } from "react";
import { useMedia } from "react-use";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, Loader2 } from "lucide-react";
import { useCreateFolderModal } from "../hooks/use-create-folder-modal";
import { useCreateFolder } from "../hooks/use-folders";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const folderColors = [
    { name: "Blue", value: "blue", bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" },
    { name: "Green", value: "green", bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" },
    { name: "Purple", value: "purple", bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600" },
    { name: "Orange", value: "orange", bg: "bg-orange-50", border: "border-orange-200", icon: "text-orange-600" },
    { name: "Red", value: "red", bg: "bg-red-50", border: "border-red-200", icon: "text-red-600" },
    { name: "Gray", value: "gray", bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600" },
];

export const CreateFolderModal = () => {
    const { isOpen, setIsOpen } = useCreateFolderModal();
    const isOnDesktop = useMedia("(min-width: 1024px)", true);
    const [folderName, setFolderName] = useState("");
    const [selectedColor, setSelectedColor] = useState("blue");
    
    const createFolderMutation = useCreateFolder();
    const queryClient = useQueryClient();
    const workspaceId = useWorkspaceId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!folderName.trim()) return;

        try {
            await createFolderMutation.mutateAsync({
                name: folderName.trim(),
                color: selectedColor
            });
            
            toast.success("Folder created successfully!");
            setIsOpen(false);
            setFolderName("");
            setSelectedColor("blue");
        } catch (error) {
            console.error("Error creating folder:", error);
            toast.error("Failed to create folder. Please try again.");
        }
    };

    const handleClose = () => {
        setFolderName("");
        setSelectedColor("blue");
        setIsOpen(false);
    };

    const isLoading = createFolderMutation.isPending;

    const content = (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="p-6 pb-4">
                <div className="flex items-center gap-3">
                    <Folder className="size-6 text-blue-600"/>
                    <CardTitle className="text-xl font-bold text-gray-900">
                        Create New Folder
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="folderName" className="text-sm font-medium text-gray-700">
                            Folder Name
                        </Label>
                        <Input
                            id="folderName"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="Enter folder name..."
                            className="w-full"
                            required
                            disabled={isLoading}
                            maxLength={30}
                        />
                        <div className="flex justify-end mt-1">
                            <span
                                className={cn(
                                    "text-xs transition-all duration-200 ease-in transform",
                                    folderName.length === 0 ? "opacity-0 translate-y-[-8px] pointer-events-none" : "opacity-100 translate-y-0",
                                    folderName.length >= 25 ? "text-red-500" : "text-muted-foreground"
                                )}
                            >
                                {folderName.length}/30
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                            Folder Color
                        </Label>
                        <div className="grid grid-cols-3 gap-3">
                            {folderColors.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    disabled={isLoading}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        selectedColor === color.value
                                            ? `${color.bg} ${color.border} border-2`
                                            : "bg-white border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Folder className={`size-4 ${color.icon}`}/>
                                        <span className="text-sm font-medium text-gray-700">
                                            {color.name}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!folderName.trim() || isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isLoading ? "Creating..." : "Create Folder"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );

    if (isOnDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-full sm:max-w-md p-0 border-none overflow-y-auto hide-scrollbar max-h-[75vh]">
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent>
                <div className="overflow-y-auto hide-scrollbar max-h-[75vh]">
                    {content}
                </div>
            </DrawerContent>
        </Drawer>
    );
}; 