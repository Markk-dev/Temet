"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DottedSeparator } from "@/components/dotted-line";
import { BotMessageSquare, Send, X, Bot, User } from "lucide-react";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";

interface TemBoxLLMContentProps {
    onCancel?: () => void;
}

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export const TemBoxLLMContent = ({ onCancel }: TemBoxLLMContentProps) => {  
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const workspaceId = useWorkspaceId();

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

        // Call our secure API endpoint
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    userId: 'current-user-id', // TODO: Get actual user ID
                    conversationId: 'current-conversation-id', // TODO: Get actual conversation ID
                    workspaceId: workspaceId // Pass workspace context
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get AI response');
            }

            const data = await response.json();
            
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.response,
                sender: 'ai',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error calling AI API:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
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

    return (
        <Card className="w-full h-full border-none shadow-none flex flex-col">
            <CardHeader className="p-6 pb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BotMessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                                Chat with Temet
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Your AI assistant is ready to help
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            <div className="px-6 flex-shrink-0">
                <DottedSeparator/>
            </div>

            <CardContent className="p-6 flex flex-col flex-1 min-h-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
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
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-blue-600" />
                                </div>
                            )}
                            
                            <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                    message.sender === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                    {formatTime(message.timestamp)}
                                </p>
                            </div>

                            {message.sender === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                            )}
                        </div>
                    ))
                    )}
                    
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="bg-gray-100 rounded-lg px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-sm text-gray-500">Temet is typing...</span>
                                </div>
                            </div>
                        </div>
                    )}
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
    );
};
