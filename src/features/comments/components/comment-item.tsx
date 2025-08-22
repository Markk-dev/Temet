"use client";

import { useState } from "react";
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

export const CommentItem = ({ 
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

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this comment?")) {
            deleteComment(comment.$id, {
                onSuccess: () => {
                    toast.success("Comment deleted successfully!");
                },
                onError: () => {
                    toast.error("Failed to delete comment. Please try again.");
                }
            });
        }
    };

    const handleReply = () => {
        onReply?.(comment.$id);
    };

    const handleEdit = () => {
        onEdit?.(comment);
    };

    // Function to get actual values for pinned fields
    const getPinnedFieldValue = (field: string) => {
        switch (field) {
            case 'assignee':
                if (comment.pinnedFieldValues?.assignee) {
                    if (Array.isArray(comment.pinnedFieldValues.assignee)) {
                        return comment.pinnedFieldValues.assignee.map((a: any) => a.name).join(', ');
                    }
                    return comment.pinnedFieldValues.assignee.name;
                }
                return taskDetails?.assignee?.name || 'Unassigned';
            case 'status':
                return comment.pinnedFieldValues?.status || taskDetails?.status || 'No Status';
            case 'dueDate':
                if (comment.pinnedFieldValues?.dueDate) {
                    return new Date(comment.pinnedFieldValues.dueDate).toLocaleDateString();
                }
                return taskDetails?.dueDate ? new Date(taskDetails.dueDate).toLocaleDateString() : 'No Due Date';
            default:
                return field;
        }
    };

    return (
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
                        {comment.pinnedFields && comment.pinnedFields.length > 0 && (
                            <div className="absolute bottom-2 right-2 flex flex-wrap gap-1 justify-end">
                                {comment.pinnedFields.map((field, index) => (
                                    <Badge key={index} variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                        {getPinnedFieldValue(field)}
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
                        <CommentItem
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
    );
}; 