"use client"

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DottedSeparator } from "@/components/dotted-line";
import { BotMessageSquare, Send, Bot, User, Menu, X } from "lucide-react";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { useCurrent } from "@/features/auth/api/use-current";
import { ConversationSidebar } from "./conversation-sidebar";
import { motion, AnimatePresence } from "framer-motion";

interface TemBoxLLMContentProps {
    onCancel?: () => void;
    conversationId?: string;
    onConversationUpdate?: (conversationId: string) => void;
    showConversationToggle?: boolean;
    onConversationSelect?: (conversationId: string) => void;
    currentConversationId?: string;
    refreshTrigger?: number;
    onConversationDelete?: () => void;
    showCloseButton?: boolean;
}

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export const TemBoxLLMContent = ({ 
    onCancel, 
    conversationId, 
    onConversationUpdate,
    showConversationToggle = false,
    onConversationSelect,
    currentConversationId: propCurrentConversationId,
    refreshTrigger,
    onConversationDelete,
    showCloseButton = true
}: TemBoxLLMContentProps) => {  
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState(conversationId || '');
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const workspaceId = useWorkspaceId();
    const { data: user } = useCurrent();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom function
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-scroll when component mounts or conversation changes
    useEffect(() => {
        scrollToBottom();
    }, [conversationId]);

    // Load messages when conversationId changes
    useEffect(() => {
        if (conversationId) {
            loadConversation(conversationId);
        } else {
            setMessages([]);
            setCurrentConversationId('');
        }
    }, [conversationId]);

    const loadConversation = async (convId: string) => {
        try {
            const response = await fetch(`/api/conversations/${convId}/messages`);
            if (response.ok) {
                const data = await response.json();
                const loadedMessages = data.messages.map((msg: any) => ({
                    id: msg.id,
                    content: msg.content,
                    sender: msg.sender,
                    timestamp: new Date(msg.timestamp)
                }));
                setMessages(loadedMessages);
                setCurrentConversationId(convId);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputMessage.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        
        // Scroll to bottom after user message
        setTimeout(scrollToBottom, 100);

        // Call our secure API endpoint
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    userId: user?.$id || 'anonymous',
                    userName: user?.name || 'User',
                    conversationId: currentConversationId || undefined,
                    workspaceId: workspaceId // Pass workspace context
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            
            // Update conversation ID if we got a new one
            if (data.conversationId && data.conversationId !== currentConversationId) {
                setCurrentConversationId(data.conversationId);
                onConversationUpdate?.(data.conversationId);
            }
            
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.response,
                sender: 'ai',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMessage]);
            
            // Scroll to bottom after AI response
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error calling AI API:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'I\'m currently experiencing high demand and all AI models are temporarily unavailable. This usually happens when there\'s a lot of traffic. Please try again in a few minutes!',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Animation variants (same as comment section)
    const slideVariants = {
        hidden: { 
            x: "-100%"
        },
        visible: { 
            x: 0
        },
        exit: { 
            x: "-100%"
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.3,
                delay: 0
            }
        },
        exit: { 
            opacity: 0,
            transition: { 
                duration: 0.2,
                delay: 0
            }
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Mobile Sidebar Overlay with Animation */}
            <AnimatePresence>
                {showConversationToggle && showMobileSidebar && (
                    <motion.div
                        className="absolute inset-0 z-50 lg:hidden"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div 
                            className="absolute inset-0 bg-black bg-opacity-50" 
                            onClick={() => setShowMobileSidebar(false)} 
                        />
                        <motion.div 
                            className="absolute left-0 top-0 bottom-0 w-80 z-10"
                            variants={slideVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 300,
                                mass: 0.8,
                            }}
                        >
                            <ConversationSidebar 
                                onConversationSelect={(id) => {
                                    onConversationSelect?.(id);
                                    setShowMobileSidebar(false);
                                }}
                                currentConversationId={propCurrentConversationId}
                                refreshTrigger={refreshTrigger}
                                onConversationDelete={onConversationDelete}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Card className="w-full h-full border-none shadow-none flex flex-col">
            <CardHeader className="p-6 pb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {showConversationToggle && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                                className="h-8 w-8 p-0 lg:hidden"
                            >
                                <Menu className="w-4 h-4" />
                            </Button>
                        )}
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BotMessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                                Chat with Temet
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Your AI assistant is ready to help
                            </p>
                        </div>
                    </div>
                    {showCloseButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            
            <div className="px-6 flex-shrink-0">
                <DottedSeparator/>
            </div>

            <CardContent className="p-6 flex flex-col flex-1 min-h-0">
                                       {/* Messages Area */}
                       <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                            <BotMessageSquare className="w-12 h-12 mb-4 text-gray-400" />
                            <p className="text-lg font-semibold">Start a conversation with your AI assistant!</p>
                            <p className="text-sm">Try asking: "What can you help me with?"</p>
                        </div>
                    ) : (
                                                       messages.map((message) => (
                               <div
                                   key={message.id}
                                   className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                               >
                                   {message.sender === 'ai' && (
                                       <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                           <Bot className="w-4 h-4 text-white" />
                                       </div>
                                   )}
                                   
                                   <div
                                       className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                                           message.sender === 'user'
                                               ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                                               : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                                       }`}
                                   >
                                       <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                       {message.sender === 'ai' && (
                                           <p className="text-xs mt-2 text-gray-400">
                                               {formatTime(message.timestamp)}
                                           </p>
                                       )}
                                   </div>

                                   {message.sender === 'user' && (
                                       <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
                                           <User className="w-4 h-4 text-gray-600" />
                                       </div>
                                   )}
                               </div>
                           ))
                    )}
                    
                                               {isLoading && (
                               <div className="flex gap-3 justify-start">
                                   <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                       <Bot className="w-4 h-4 text-white" />
                                   </div>
                                   <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                       <div className="flex items-center gap-2">
                                           <div className="flex space-x-1">
                                               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                           </div>
                                           <span className="text-sm text-gray-600">Temet is typing...</span>
                                       </div>
                                   </div>
                               </div>
                           )}
                    
                    {/* Scroll target for auto-scroll */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex gap-2 pt-4 border-t flex-shrink-0">
                    <Input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here..."
                        className="flex-1"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="h-10 px-4"
                    >
                        <Send className="w-5 h-6" />
                    </Button>
                </div>
            </CardContent>
            </Card>
        </div>
    );
};
