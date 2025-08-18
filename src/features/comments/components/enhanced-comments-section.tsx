"use client";

import { useState } from "react";
import { MessageSquare, Loader, Plus } from "lucide-react";

import { useGetComments } from "../api/use-get-comments";
import { CommentItem } from "./comment-item";
import { EnhancedCommentForm } from "./enhanced-comment-form";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-line";
import { useRealtimeComments } from "../hooks/use-realtime-comments";
import { Comment } from "../types";

interface EnhancedCommentsSectionProps {
    taskId: string;
    workspaceId: string;
    taskDetails?: {
        assignee?: any;
        dueDate?: string;
        status?: string;
    };
}

export const EnhancedCommentsSection = ({ 
    taskId, 
    workspaceId, 
    taskDetails 
}: EnhancedCommentsSectionProps) => {
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [replyParentId, setReplyParentId] = useState<string>("");
    const [editComment, setEditComment] = useState<Comment | null>(null);
    
    const { data: comments, isLoading, error } = useGetComments(taskId, workspaceId);
    const commentsArray = comments?.data || [];

    // Enable real-time comments synchronization
    useRealtimeComments(taskId, workspaceId);

    const handleOpenComment = () => {
        setIsCommentOpen(true);
    };

    const handleCloseComment = () => {
        setIsCommentOpen(false);
    };

    const handleReply = (commentId: string) => {
        setReplyParentId(commentId);
        setIsReplyOpen(true);
    };

    const handleCloseReply = () => {
        setIsReplyOpen(false);
        setReplyParentId("");
    };

    const handleEdit = (comment: Comment) => {
        setEditComment(comment);
        setIsEditOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
        setEditComment(null);
    };

    if (isLoading) {
        return (
            <div className="bg-white border rounded-lg p-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Comments</h3>
                        {commentsArray.length > 0 && (
                            <span className="text-sm text-gray-500">
                                ({commentsArray.length})
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={handleOpenComment}
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Comment
                    </Button>
                </div>
                <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Comments</h3>
                    </div>
                    <Button
                        onClick={handleOpenComment}
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Comment
                    </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                    Failed to load comments
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border rounded-lg p-4 w-full">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <h3 className="text-base font-semibold">Comments</h3>
                            {commentsArray.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    ({commentsArray.length})
                                </span>
                            )}
                        </div>
                        <Button
                            onClick={handleOpenComment}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 h-8 px-3"
                        >
                            <Plus className="h-3 w-3" />
                            Add Comment
                        </Button>
                    </div>
                    
                    <DottedSeparator className="mb-4" />
                    
                    {/* Comments List */}
                    {commentsArray && commentsArray.length > 0 ? (
                        <div className="space-y-3 max-h-[320px] overflow-y-auto">
                            {commentsArray.map((comment: Comment) => (
                                <CommentItem
                                    key={comment.$id}
                                    comment={comment}
                                    taskId={taskId}
                                    workspaceId={workspaceId}
                                    taskDetails={taskDetails}
                                    onReply={handleReply}
                                    onEdit={handleEdit}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-center py-8 text-sm text-gray-500">
                                {isLoading ? "Loading comments..." : 
                                 error ? "Failed to load comments" :
                                 "No comments yet. Be the first to comment!"}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Empty second column for spacing */}
                <div></div>
            </div>

            {/* Comment Form */}
            <EnhancedCommentForm
                taskId={taskId}
                workspaceId={workspaceId}
                taskDetails={taskDetails}
                isOpen={isCommentOpen}
                onClose={handleCloseComment}
            />

            {/* Reply Form */}
            <EnhancedCommentForm
                taskId={taskId}
                workspaceId={workspaceId}
                taskDetails={taskDetails}
                isOpen={isReplyOpen}
                onClose={handleCloseReply}
                parentId={replyParentId}
                mode="reply"
            />

            {/* Edit Form */}
            <EnhancedCommentForm
                taskId={taskId}
                workspaceId={workspaceId}
                taskDetails={taskDetails}
                isOpen={isEditOpen}
                onClose={handleCloseEdit}
                commentId={editComment?.$id}
                initialContent={editComment?.content}
                initialPriority={editComment?.priority}
                initialPinnedFields={editComment?.pinnedFields}
                initialMentions={editComment?.mentions}
                mode="edit"
            />
        </>
    );
}; 