"use client"

import { useMedia } from "react-use";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useTemboxLLMModal } from "../hooks/use-tembox-llm-modal";
import { TemBoxLLMContent } from "@/features/tembox/components/tembox-LLM-content";

export const TemBoxLLM = () => {
    const {isOpen, setIsOpen, close} = useTemboxLLMModal();
    const isOnDesktop = useMedia("(min-width: 1024px)", true);

    if(isOnDesktop){
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-full sm:max-w-xl lg:max-w-2xl p-0 border-none h-[600px] flex flex-col">
                    <TemBoxLLMContent onCancel={close}/>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="h-[500px] flex flex-col">
                <TemBoxLLMContent onCancel={close}/>
            </DrawerContent>
        </Drawer>
    );
};
