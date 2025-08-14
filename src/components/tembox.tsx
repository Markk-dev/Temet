"use client";

import { usePathname } from "next/navigation";
import { HiUserGroup } from "react-icons/hi";
import { HardDrive } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTemboxModal } from "@/features/tembox/hooks/use-tembox-modal";

export const TemBox = () => {
    const pathname = usePathname();
    const { open } = useTemboxModal();

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-sm uppercase text-neutal-500"> Assets </p>
            </div>
            
            <button 
                onClick={open}  
                className={cn(
                    "flex items-center gap-2.5 px-6 py-3 rounded-lg transition cursor-pointer bg-blue-600 text-white shadow-sm hover:bg-blue-700",
                    pathname.includes('/tembox') && "bg-blue-700 shadow-md"
                )}
            >
                <HardDrive className="w-5 h-5 text-white"/>
                <span className="truncate text-sm font-medium">Storage</span>
            </button>
            
            <div 
                className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-md hover:opacity-75 transition cursor-pointer text-primary",
                    pathname.includes('/collaboration') && "bg-white shadow-sm hover:opacity-100 text-primary"
                )}
            >
                <HiUserGroup className="size-5 text-neutral-500"/>
                <span className="truncate">Collaboration</span>
            </div>
        </div>
    );
}; 