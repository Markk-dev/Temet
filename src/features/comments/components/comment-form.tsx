"use client";

import { useState } from "react";
import { Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCreateComment } from "../api/use-create-comment";
import { useCurrent } from "@/features/auth/api/use-current";

interface CommentFormProps {
    taskId: string;
    workspaceId: string;
}

export const CommentForm = ({ taskId, workspaceId }: CommentFormProps) => {
    const [content, setContent] = useState("");
    const { data: currentUser } = useCurrent();
    const { mutate: createComment, isPending } = useCreateComment();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!content.trim()) return;

        createComment(
            {
                taskId,
                workspaceId,
                content: content.trim(),
            },
            {
                onSuccess: () => {
                    setContent("");
                },
            }
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write a comment..."
                            rows={3}
                            disabled={isPending}
                            className="resize-none"
                        />
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isPending || !content.trim()}
                            >
                                <Send className="h-4 w-4 mr-1" />
                                {isPending ? "Sending..." : "Comment"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 