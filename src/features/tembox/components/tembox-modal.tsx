"use client"

import { useMedia } from "react-use";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { TemBoxContent } from "./tembox-content";
import { useTemboxModal } from "../hooks/use-tembox-modal";

export const TemBoxModal = () => {
    const {isOpen, setIsOpen, close} = useTemboxModal();
    const isOnDesktop = useMedia("(min-width: 1024px)", true);

    if(isOnDesktop){
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-[95vw] max-w-2xl mx-4 p-0 border-none overflow-y-auto hide-scrollbar max-h-[75vh]">
                    <TemBoxContent onCancel={close}/>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent>
                <div className="overflow-y-auto hide-scrollbar max-h-[75vh]">
                    <TemBoxContent onCancel={close}/>
                </div>                 
            </DrawerContent>
        </Drawer>
    );
}; 