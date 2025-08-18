"use client";

import { MessageSquare, Loader } from "lucide-react";

import { useGetComments } from "../api/use-get-comments";
import { CommentItem } from "./comment-item";
import { CommentForm } from "./comment-form";
import { Comment } from "../types";

interface CommentsSectionProps {
    taskId: string;
    workspaceId: string;
}

export const CommentsSection = ({ taskId, workspaceId }: CommentsSectionProps) => {
    const { data: comments, isLoading, error } = useGetComments(taskId, workspaceId);

    if (isLoading) {
        return (
            <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                    <MessageSquare className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Comments</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                    <MessageSquare className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Comments</h3>
                </div>
                <div className="text-center py-8 text-gray-500">
                    Failed to load comments
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Comments</h3>
                {comments && comments.length > 0 && (
                    <span className="text-sm text-gray-500">
                        ({comments.length})
                    </span>
                )}
            </div>
            
            <div className="space-y-6">
                <CommentForm taskId={taskId} workspaceId={workspaceId} />
                
                {comments && comments.length > 0 ? (
                    <div className="space-y-4">
                        {comments.map((comment: Comment) => (
                            <CommentItem
                                key={comment.$id}
                                comment={comment}
                                taskId={taskId}
                                workspaceId={workspaceId}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No comments yet. Be the first to comment!
                    </div>
                )}
            </div>
        </div>
    );
}; 