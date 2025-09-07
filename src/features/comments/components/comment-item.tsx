"use client";

import React, { useState, useMemo, useCallback } from "react";
import { MessageSquare, Reply, Edit, Trash, User, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { 
  IoIosArrowUp, 
  IoIosArrowDown, 
  IoIosRemove,
  IoIosTrendingUp,
  IoIosTrendingDown
} from "react-icons/io";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Comment } from "../types";
import { useUpdateComment } from "../api/use-update-comment";
import { useDeleteComment } from "../api/use-delete-comment";
import { useCurrent } from "@/features/auth/api/use-current";
import { EnhancedCommentForm } from "./enhanced-comment-form";
import { UseConfirm } from "@/hooks/use-confirm";

interface CommentItemProps {
    comment: Comment;
    taskId: string;
    workspaceId: string;
    taskDetails?: {
        assignee?: any;
        dueDate?: string;
        status?: string;
    };
    onReply?: (commentId: string) => void;
    onEdit?: (comment: Comment) => void;
    level?: number;
}

const priorityConfig = {
    LOWEST: { icon: IoIosArrowDown, color: "text-gray-500", bg: "bg-gray-100", label: "Lowest" },
    LOW: { icon: IoIosArrowDown, color: "text-blue-500", bg: "bg-blue-100", label: "Low" },
    MEDIUM: { icon: IoIosRemove, color: "text-yellow-500", bg: "bg-yellow-100", label: "Medium" },
    HIGH: { icon: IoIosArrowUp, color: "text-orange-500", bg: "bg-orange-100", label: "High" },
    HIGHEST: { icon: IoIosTrendingUp, color: "text-red-500", bg: "bg-red-100", label: "Highest" },
};

const CommentItemComponent = ({ 
    comment, 
    taskId, 
    workspaceId,
    taskDetails,
    onReply, 
    onEdit,
    level = 0 
}: CommentItemProps) => {
    const { data: currentUser } = useCurrent();
    const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment({ taskId });

    const isAuthor = currentUser?.$id === comment.authorId;
    const canEdit = isAuthor;
    const canDelete = isAuthor;

    const [ConfirmDialog, confirm] = UseConfirm(
        "Delete Comment",
        "Are you sure you want to delete this comment? This action cannot be undone.",
        "deletion"
    );

    // Memoize handlers to prevent unnecessary re-renders
    const handleDelete = useCallback(async () => {
        const ok = await confirm();
        if (!ok) {
            return;
        }

        deleteComment(comment.$id, {
            onSuccess: () => {
                toast.success("Comment deleted successfully!");
            },
            onError: () => {
                toast.error("Failed to delete comment. Please try again.");
            }
        });
    }, [comment.$id, deleteComment, confirm]);

    const handleReply = useCallback(() => {
        onReply?.(comment.$id);
    }, [comment.$id, onReply]);

    const handleEdit = useCallback(() => {
        onEdit?.(comment);
    }, [comment, onEdit]);

    
    const getPinnedFieldValue = useCallback((field: string) => {
        
        
        if (comment.pinnedFieldValues && typeof comment.pinnedFieldValues === 'object') {
            const pinnedValues = comment.pinnedFieldValues as any;
            
            switch (field) {
                case 'assignee':
                    if (pinnedValues.assignee) {
                        if (Array.isArray(pinnedValues.assignee)) {
                            return pinnedValues.assignee.map((a: any) => a.name || a.email).join(', ');
                        }
                        return pinnedValues.assignee.name || pinnedValues.assignee.email || 'Unknown Assignee';
                    }
                    break;
                case 'status':
                    if (pinnedValues.status) {
                        return pinnedValues.status;
                    }
                    break;
                case 'dueDate':
                    if (pinnedValues.dueDate) {
                        try {
                            return new Date(pinnedValues.dueDate).toLocaleDateString();
                        } catch (e) {
                            return pinnedValues.dueDate;
                        }
                    }
                    break;
            }
        }
        
        
        
        return null;
    }, [comment.pinnedFieldValues]);

    
    // Memoize the pinned field values to prevent unnecessary recalculations
    const pinnedFieldValues = useMemo(() => {
        if (!comment.pinnedFields || !comment.pinnedFields.length) return [];
        
        return comment.pinnedFields.map((field, index) => {
            const fieldValue = getPinnedFieldValue(field);
            return fieldValue ? { field, value: fieldValue, index } : null;
        }).filter((item): item is { field: string; value: any; index: number } => item !== null);
    }, [comment.pinnedFields, getPinnedFieldValue]);

    return (
        <>
            <div className={`space-y-3 ${level > 0 && level <= 2 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
                <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                            {comment.author?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">
                                {comment.author?.name || "Unknown User"}
                            </span>
                            
                            {/* Priority Badge - Now before time */}
                            {comment.priority && (
                                <Badge variant="secondary" className="text-xs">
                                    {(() => {
                                        const config = priorityConfig[comment.priority as keyof typeof priorityConfig];
                                        const Icon = config.icon;
                                        return (
                                            <div className="flex items-center gap-1">
                                                <Icon className={`h-3 w-3 ${config.color}`} />
                                                {config.label}
                                            </div>
                                        );
                                    })()}
                                </Badge>
                            )}
                            
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        
                        {/* Combined Comment Content and Pinned Fields */}
                        <div className="relative">
                            <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 pr-20">
                                {comment.content}
                            </div>
                            
                            {/* Pinned Fields as small badges in bottom right */}
                            {pinnedFieldValues.length > 0 && (
                                <div className="absolute bottom-2 right-2 flex flex-wrap gap-1 justify-end">
                                    {pinnedFieldValues.map(({ field, value, index }) => (
                                        <Badge key={index} variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                            {value}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            {/* Show Reply button at all levels - no level restriction */}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleReply}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <Reply className="h-4 w-4 mr-1" />
                                Reply
                            </Button>
                            
                            {canEdit && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleEdit}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                            )}
                            
                            {canDelete && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash className="h-4 w-4 mr-1" />
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Render nested replies at all levels - but visual indentation capped at level 2 */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-3">
                        {comment.replies.map((reply) => (
                            <CommentItemComponent
                                key={reply.$id}
                                comment={reply}
                                taskId={taskId}
                                workspaceId={workspaceId}
                                taskDetails={taskDetails}
                                onReply={onReply}
                                onEdit={onEdit}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Custom Delete Confirmation Dialog */}
            <ConfirmDialog />
        </>
    );
};

export const CommentItem = React.memo(CommentItemComponent); 