"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Trash2, X } from "lucide-react";
import { useTemboxLLMModal } from "../hooks/use-tembox-llm-modal";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { useCurrent } from "@/features/auth/api/use-current";

interface Conversation {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  workspaceId?: string;
}

interface ConversationSidebarProps {
  onConversationSelect: (conversationId: string) => void;
  currentConversationId?: string;
  refreshTrigger?: number; // Add refresh trigger prop
  onConversationDelete?: () => void; // Add delete callback
}

export const ConversationSidebar = ({ 
  onConversationSelect, 
  currentConversationId,
  refreshTrigger,
  onConversationDelete
}: ConversationSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { open } = useTemboxLLMModal();
  const workspaceId = useWorkspaceId();
  const { data: user } = useCurrent();

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/conversations?userId=${user?.$id || 'anonymous'}&workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.$id) {
      fetchConversations();
    }
  }, [workspaceId, refreshTrigger, user?.$id]);

  // Also fetch conversations when the modal opens
  useEffect(() => {
    if (workspaceId && user?.$id) {
      fetchConversations();
    }
  }, [workspaceId, user?.$id]);

  const handleNewChat = () => {
    onConversationSelect(''); // Empty string means new conversation
    open();
  };

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect(conversationId);
    open();
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering conversation selection
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from local state
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // If this was the current conversation, clear it
        if (currentConversationId === conversationId) {
          onConversationSelect('');
          onConversationDelete?.();
        }
        
        // Refresh the list
        fetchConversations();
      } else {
        console.error('Failed to delete conversation');
        alert('Failed to delete conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Error deleting conversation. Please try again.');
    }
  };


  return (
    <Card className="w-80 h-full border-r rounded-none">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Conversations</h3>
          <Button
            onClick={handleNewChat}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-lg mb-2"></div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs text-gray-400">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative rounded-lg ${
                    currentConversationId === conversation.id 
                      ? 'bg-blue-100' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-auto p-3 text-left ${
                      currentConversationId === conversation.id 
                        ? 'text-blue-900' 
                        : 'text-gray-900'
                    }`}
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    <div className="flex flex-col w-full">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium truncate flex-1 pr-8 max-w-[200px]">
                          {conversation.title}
                        </span>
                      </div>
                    </div>
                  </Button>
                  
                  {/* Delete button - appears on hover */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
