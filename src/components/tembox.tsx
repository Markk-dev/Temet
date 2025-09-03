"use client";

import { usePathname } from "next/navigation";
import { HardDrive, Palette, BotMessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTemboxModal } from "@/features/tembox/hooks/use-tembox-modal";

export const TemBox = () => {
    const pathname = usePathname();
    const { open } = useTemboxModal();

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-neutal-500"> Assets </p>
            </div>
            
            <div className="w-full max-w-sm flex flex-col gap-y-1">
                <div className="flex rounded-lg overflow-hidden border border-border">
                    <button 
                        onClick={open}  
                        className={cn(
                            "text-sm flex-1 rounded-none border-0 h-10 gap-2 font-medium bg-gradient-to-b from-blue-600 to-blue-700 text-primary-foreground hover:from-blue-700 hover:to-blue-700 transition-all flex items-center justify-center",
                            pathname.includes('/tembox') && "from-blue-700 to-blue-800"
                        )}
                    >
                        <HardDrive className="w-4 h-4" />
                        Storage
                    </button>

                    <div className="w-px bg-border" />
                    
                    <div 
                        className={cn(
                            "text-sm flex-1 rounded-none border-0 h-10 gap-2 font-medium bg-gradient-to-b from-blue-600 to-blue-700 text-primary-foreground hover:from-blue-700 hover:to-blue-700 transition-all flex items-center justify-center cursor-pointer",
                            pathname.includes('/collaboration') && "from-blue-700 to-blue-800"
                        )}
                    >
                        <Palette className="w-4 h-4" />
                        Canvas
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <button 
                        onClick={open}  
                        className={cn(
                            "text-sm flex-1 rounded-md border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 px-4 py-2 mt-2",
                            pathname.includes('/tembox') && "border-gray-400  bg-gray-50"
                        )}
                    >
                        <BotMessageSquare className="w-4 h-4" />
                        Temet
                    </button>
                </div>
            </div>
        </div>
    );
}; 