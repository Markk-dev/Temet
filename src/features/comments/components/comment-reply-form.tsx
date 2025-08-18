"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComment } from "../api/use-create-comment";

interface CommentReplyFormProps {
    taskId: string;
    workspaceId: string;
    parentId?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

export const CommentReplyForm = ({
    taskId,
    workspaceId,
    parentId,
    onCancel,
    onSuccess,
}: CommentReplyFormProps) => {
    const [content, setContent] = useState("");
    const { mutate: createComment, isPending } = useCreateComment();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!content.trim()) return;

        createComment(
            {
                taskId,
                workspaceId,
                content: content.trim(),
                parentId,
            },
            {
                onSuccess: () => {
                    setContent("");
                    onSuccess();
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a reply..."
                rows={3}
                disabled={isPending}
                className="resize-none"
            />
            <div className="flex items-center space-x-2">
                <Button
                    type="submit"
                    size="sm"
                    disabled={isPending || !content.trim()}
                >
                    <Send className="h-4 w-4 mr-1" />
                    {isPending ? "Sending..." : "Reply"}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                </Button>
            </div>
        </form>
    );
}; 