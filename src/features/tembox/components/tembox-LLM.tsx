"use client"

import { useState, useEffect } from "react";
import { useMedia } from "react-use";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useTemboxLLMModal } from "../hooks/use-tembox-llm-modal";
import { TemBoxLLMContent } from "@/features/tembox/components/tembox-LLM-content";
import { ConversationSidebar } from "@/features/tembox/components/conversation-sidebar";

export const TemBoxLLM = () => {
    const {isOpen, setIsOpen, close} = useTemboxLLMModal();
    const isOnDesktop = useMedia("(min-width: 1024px)", true);
    const [currentConversationId, setCurrentConversationId] = useState<string>('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Load conversation ID from localStorage on mount
    useEffect(() => {
        const savedConversationId = localStorage.getItem('temet-current-conversation');
        if (savedConversationId) {
            setCurrentConversationId(savedConversationId);
        }
    }, []);

    const handleConversationSelect = (conversationId: string) => {
        setCurrentConversationId(conversationId);
        if (conversationId) {
            localStorage.setItem('temet-current-conversation', conversationId);
        } else {
            localStorage.removeItem('temet-current-conversation');
        }
    };

    const handleConversationUpdate = (conversationId: string) => {
        setCurrentConversationId(conversationId);
        if (conversationId) {
            localStorage.setItem('temet-current-conversation', conversationId);
        }
        setRefreshTrigger(prev => prev + 1); // Trigger sidebar refresh
    };

    const handleConversationDelete = () => {
        setCurrentConversationId('');
        localStorage.removeItem('temet-current-conversation');
        setRefreshTrigger(prev => prev + 1); // Trigger sidebar refresh
    };

    if(isOnDesktop){
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-full sm:max-w-4xl lg:max-w-6xl p-0 border-none h-[600px] flex flex-row">
                    <ConversationSidebar 
                        onConversationSelect={handleConversationSelect}
                        currentConversationId={currentConversationId}
                        refreshTrigger={refreshTrigger}
                        onConversationDelete={handleConversationDelete}
                    />
                    <div className="flex-1">
                        <TemBoxLLMContent 
                            onCancel={close} 
                            conversationId={currentConversationId}
                            onConversationUpdate={handleConversationUpdate}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerContent className="h-[500px] flex flex-col">
                <TemBoxLLMContent 
                    onCancel={close} 
                    conversationId={currentConversationId}
                    onConversationUpdate={handleConversationUpdate}
                />
            </DrawerContent>
        </Drawer>
    );
};
