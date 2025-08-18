    "use client";

    import { useState, useRef, useEffect } from "react";
    import { Send, AtSign, Flag, User, X, ChevronDown } from "lucide-react";
    import { 
    IoIosArrowUp, 
    IoIosArrowDown, 
    IoIosRemove,
    IoIosTrendingUp,

    } from "react-icons/io";
    import { motion, AnimatePresence } from "framer-motion";
    import { toast } from "sonner";

    import { Button } from "@/components/ui/button";
    import { Textarea } from "@/components/ui/textarea";
    import { Avatar, AvatarFallback } from "@/components/ui/avatar";
    import { Badge } from "@/components/ui/badge";
    import { DottedSeparator } from "@/components/dotted-line";
    import { useCreateComment } from "../api/use-create-comment";
    import { useUpdateComment } from "../api/use-update-comment";
    import { useCurrent } from "@/features/auth/api/use-current";
    import { useGetMembers } from "@/features/members/api/use-get-members";

    interface EnhancedCommentFormProps {
        taskId: string;
        workspaceId: string;
        taskDetails?: {
            assignee?: any;
            dueDate?: string;
            status?: string;
        };
        onClose?: () => void;
        isOpen?: boolean;
        parentId?: string; // For replies
        commentId?: string; // For editing
        initialContent?: string; // For editing
        initialPriority?: "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST" | null; // For editing
        initialPinnedFields?: string[]; // For editing
        initialMentions?: string[]; // For editing
        mode?: "create" | "edit" | "reply"; // Form mode
    }

    type Priority = "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";

    const priorityConfig = {
        LOWEST: { icon: IoIosArrowDown, color: "text-gray-500", bg: "bg-gray-100", label: "Lowest" },
        LOW: { icon: IoIosArrowDown, color: "text-blue-500", bg: "bg-blue-100", label: "Low" },
        MEDIUM: { icon: IoIosRemove, color: "text-yellow-500", bg: "bg-yellow-100", label: "Medium" },
        HIGH: { icon: IoIosArrowUp, color: "text-orange-500", bg: "bg-orange-100", label: "High" },
        HIGHEST: { icon: IoIosTrendingUp, color: "text-red-500", bg: "bg-red-100", label: "Highest" },
    };

    
    const slideVariants = {
    hidden: { 
        x: "100%"
    },
    visible: { 
        x: 0
    },
    exit: { 
        x: "100%"
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

    export const EnhancedCommentForm = ({ 
    taskId, 
    workspaceId, 
    taskDetails, 
    onClose, 
    isOpen = true,
    parentId,
    commentId,
    initialContent = "",
    initialPriority = null,
    initialPinnedFields = [],
    initialMentions = [],
    mode = "create"
}: EnhancedCommentFormProps) => {
    const [content, setContent] = useState(initialContent);
    const [selectedPriority, setSelectedPriority] = useState<Priority | null>(initialPriority as Priority | null);
    const [pinnedFields, setPinnedFields] = useState<{
        assignee?: boolean;
        dueDate?: boolean;
        status?: boolean;
    }>(() => {
        const initial: any = {};
        initialPinnedFields.forEach(field => {
            initial[field] = true;
        });
        return initial;
    });
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [cursorPosition, setCursorPosition] = useState(0);
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [selectedMentions, setSelectedMentions] = useState<{userId: string, username: string}[]>([]);
        
        const { data: currentUser } = useCurrent();
        const { data: members } = useGetMembers({ workspaceId });
        const { mutate: createComment, isPending } = useCreateComment();
        const { mutate: updateComment, isPending: isUpdating } = useUpdateComment({ taskId });
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        // Initialize form state when initial values change (for edit mode)
        useEffect(() => {
            if (mode === "edit") {
                setContent(initialContent || "");
                setSelectedPriority(initialPriority as Priority | null);
                
                // Initialize pinned fields
                const initialPinnedFieldsState: any = {};
                if (initialPinnedFields && Array.isArray(initialPinnedFields)) {
                    initialPinnedFields.forEach(field => {
                        initialPinnedFieldsState[field] = true;
                    });
                }
                setPinnedFields(initialPinnedFieldsState);
                
                // Initialize mentions with user details
                if (initialMentions && Array.isArray(initialMentions) && members?.documents) {
                    const mentionsWithUsernames = initialMentions.map(userId => {
                        const member = members.documents.find(m => m.$id === userId);
                        return {
                            userId,
                            username: member?.name || member?.email || "Unknown User"
                        };
                    });
                    setSelectedMentions(mentionsWithUsernames);
                } else {
                    setSelectedMentions([]);
                }
            }
        }, [mode, initialContent, initialPriority, initialPinnedFields, initialMentions, members?.documents]);

        
        const insertMention = (userId: string, username: string) => {
            
            if (!selectedMentions.some(m => m.userId === userId)) {
                setSelectedMentions(prev => [...prev, { userId, username }]);
            }
            
            
            const beforeAt = content.slice(0, content.lastIndexOf('@'));
            const afterCursor = content.slice(cursorPosition);
            const newContent = beforeAt + afterCursor;
            setContent(newContent);
            
            setShowMentions(false);
            setMentionQuery("");
            textareaRef.current?.focus();
        };

        const removeMention = (username: string) => {
            setSelectedMentions(prev => prev.filter(m => m.username !== username));
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const value = e.target.value;
            setContent(value);
            
            const cursorPos = e.target.selectionStart;
            setCursorPosition(cursorPos);
            
            
            const beforeCursor = value.slice(0, cursorPos);
            const atIndex = beforeCursor.lastIndexOf('@');
            
            if (atIndex !== -1 && atIndex < cursorPos) {
                const query = beforeCursor.slice(atIndex + 1);
                setMentionQuery(query);
                setShowMentions(true);
            } else {
                setShowMentions(false);
            }
        };

        
        // Simplified field press - just tap, no hold
        const handleFieldPress = (field: 'assignee' | 'status') => {
            if (field === 'assignee') {
                setShowAssigneeDropdown(true);
                setShowStatusDropdown(false);
            } else if (field === 'status') {
                setShowStatusDropdown(true);
                setShowAssigneeDropdown(false);
            }
        };

        // Remove all the mouse down/up/leave handlers since we're not using hold anymore

        
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Element;
                if (!target.closest('.dropdown-container')) {
                    setShowAssigneeDropdown(false);
                    setShowStatusDropdown(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            
            if (!content.trim()) return;

            const commentData = {
                taskId,
                workspaceId,
                content: content.trim(),
                priority: selectedPriority || undefined,
                pinnedFields: Object.keys(pinnedFields).filter(key => pinnedFields[key as keyof typeof pinnedFields]),
                mentions: selectedMentions.map(m => m.userId), 
            };

            if (mode === "edit" && commentId) {
                // Handle edit mode
                updateComment(
                    { 
                        commentId, 
                        data: { 
                            content: content.trim(),
                            priority: selectedPriority || undefined,
                            pinnedFields: Object.keys(pinnedFields).filter(key => pinnedFields[key as keyof typeof pinnedFields]),
                        } 
                    },
                    {
                        onSuccess: () => {
                            toast.success("Comment updated successfully!");
                            setContent("");
                            setSelectedPriority(null);
                            setPinnedFields({});
                            setSelectedMentions([]); 
                            onClose?.();
                        },
                        onError: () => {
                            toast.error("Failed to update comment. Please try again.");
                        }
                    }
                );
            } else {
                // Handle create or reply mode
                const finalData = mode === "reply" && parentId 
                    ? { ...commentData, parentId }
                    : commentData;

                createComment(finalData, {
                    onSuccess: () => {
                        const action = mode === "reply" ? "replied to" : "added";
                        toast.success(`Comment ${action} successfully!`);
                        setContent("");
                        setSelectedPriority(null);
                        setPinnedFields({});
                        setSelectedMentions([]); 
                        onClose?.();
                    },
                    onError: () => {
                        const action = mode === "reply" ? "reply to" : "add";
                        toast.error(`Failed to ${action} comment. Please try again.`);
                    }
                });
            }
        };

        const filteredMembers = members?.documents?.filter(member => 
            member.name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(mentionQuery.toLowerCase())
        ) || [];

        
        const statusOptions = ["Todo", "In Progress", "Done", "Cancelled"];

        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-end"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    >
                
                        <motion.div
                            className="absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-sm"
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
                            onClick={(e) => e.stopPropagation()}
                            >

                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-blue-600">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <AtSign className="h-4 w-4 text-white" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-white">
                                        {mode === "edit" ? "Edit Comment" : 
                                         mode === "reply" ? "Reply to Comment" : 
                                         "Add Comment"}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white hover:text-white/80"
                                    aria-label="Close comment form"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 h-full overflow-y-auto">
                                <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarFallback>
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="flex-1 relative min-w-0">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                {/* Pinned Fields Section - Always visible */}
                                                <div className="bg-blue-50 border border-blue-200 border-l-2 rounded-lg p-3 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm text-blue-700">
                                                            <Flag className="h-3 w-3" />
                                                            <span className="font-medium">Pinned Fields</span>
                                                        </div>
                                                        {Object.keys(pinnedFields).some(key => pinnedFields[key as keyof typeof pinnedFields]) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setPinnedFields({})}
                                                                className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                                                            >
                                                                Clear all
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 min-h-[20px]">
                                                        {pinnedFields.assignee && taskDetails?.assignee && (
                                                            <Badge variant="secondary" className="text-[10px] flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                                                                <span className="font-medium">Assignee:</span>
                                                                <span>{taskDetails.assignee.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPinnedFields(prev => ({ ...prev, assignee: false }))}
                                                                    className="ml-1 hover:text-red-500 text-blue-600 hover:bg-red-50 rounded-full p-0.5"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        )}
                                                        {pinnedFields.dueDate && taskDetails?.dueDate && (
                                                            <Badge variant="secondary" className="text-[10px] flex items-center gap-1 bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded">
                                                                <span className="font-medium">Due:</span>
                                                                <span>{new Date(taskDetails.dueDate).toLocaleDateString()}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPinnedFields(prev => ({ ...prev, dueDate: false }))}
                                                                    className="ml-1 hover:text-red-500 text-green-600 hover:bg-red-50 rounded-full p-0.5"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        )}
                                                        {pinnedFields.status && taskDetails?.status && (
                                                            <Badge variant="secondary" className="text-[10px] flex items-center gap-1 bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                                                                <span className="font-medium">Status:</span>
                                                                <span>{taskDetails.status}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setPinnedFields(prev => ({ ...prev, status: false }))}
                                                                    className="ml-1 hover:text-red-500 text-purple-600 hover:bg-red-50 rounded-full p-0.5"
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </button>
                                                            </Badge>
                                                        )}
                                                        {!Object.keys(pinnedFields).some(key => pinnedFields[key as keyof typeof pinnedFields]) && (
                                                            <div className="text-xs text-muted-foreground">
                                                                Add fields to highlight
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <DottedSeparator className="my-4" />

                                                {/* Comment Input */}
                                                <div className="relative">
                                                    <Textarea
                                                        ref={textareaRef}
                                                        value={content}
                                                        onChange={handleInputChange}
                                                        placeholder="Write a comment... Use @ to mention users"
                                                        rows={4}
                                                        disabled={isPending || isUpdating}
                                                        className="resize-none w-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                                                    />
                                                    
                                                    {/* Selected Mentions Display */}
                                                    {selectedMentions.length > 0 && (
                                                        <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-gray-600">Mentions:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {selectedMentions.map((mention, index) => (
                                                                        <span key={index} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                                                            @{mention.username}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeMention(mention.username)}
                                                                                className="hover:text-red-500 text-blue-700"
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </button>
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Mentions Dropdown */}
                                                    {showMentions && (
                                                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                                            <div className="p-2">
                                                                <div className="text-xs text-gray-500 mb-2">Mention users:</div>
                                                                {filteredMembers.length > 0 ? (
                                                                    filteredMembers.map((member) => (
                                                                        <button
                                                                            key={member.$id}
                                                                            type="button"
                                                                            onClick={() => insertMention(member.$id, member.name || member.email)}
                                                                            className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-left"
                                                                        >
                                                                            <Avatar className="h-6 w-6">
                                                                                <AvatarFallback className="text-xs">
                                                                                    {member.name?.charAt(0) || member.email?.charAt(0)}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <div className="text-sm font-medium">{member.name}</div>
                                                                                <div className="text-xs text-gray-500">{member.email}</div>
                                                                            </div>
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-sm text-gray-500 p-2">No users found</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <DottedSeparator className="my-4" />

                                                {/* Priority Selection */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600 whitespace-nowrap">Priority:</span>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {Object.entries(priorityConfig).map(([key, config]) => {
                                                            const Icon = config.icon;
                                                            return (
                                                                <Button
                                                                    key={key}
                                                                    type="button"
                                                                    variant={selectedPriority === key ? "secondary" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => setSelectedPriority(selectedPriority === key ? null : key as Priority)}
                                                                    className={`h-8 px-2 transition-colors hover:bg-gray-50 ${selectedPriority === key ? config.bg : ''}`}
                                                                >
                                                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <DottedSeparator className="my-4" />

                                                {/* Pin Fields Section */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600 whitespace-nowrap">Pin fields:</span>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {taskDetails?.assignee && (
                                                            <div className="relative dropdown-container">
                                                                <Button
                                                                    type="button"
                                                                    variant={pinnedFields.assignee ? "secondary" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => handleFieldPress('assignee')}
                                                                    className="h-8 px-2 flex items-center gap-1 transition-colors hover:bg-gray-50"
                                                                >
                                                                    Assignee
                                                                    <ChevronDown className="h-3 w-3" />
                                                                </Button>
                                                                
                                                                {/* Assignee Dropdown */}
                                                                {showAssigneeDropdown && (
                                                                    <div className="dropdown-container absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                                        <div className="p-1">
                                                                            <div className="text-xs text-gray-500 p-2">Select assignee:</div>
                                                                            {members?.documents?.map((member) => (
                                                                                <button
                                                                                    key={member.$id}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setPinnedFields(prev => ({ ...prev, assignee: true }));
                                                                                        setShowAssigneeDropdown(false);
                                                                                    }}
                                                                                    className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-left"
                                                                                >
                                                                                    <Avatar className="h-5 w-5">
                                                                                        <AvatarFallback className="text-xs">
                                                                                            {member.name?.charAt(0) || member.email?.charAt(0)}
                                                                                        </AvatarFallback>
                                                                                    </Avatar>
                                                                                    <div className="text-sm">{member.name}</div>
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        {taskDetails?.dueDate && (
                                                            <Button
                                                                type="button"
                                                                variant={pinnedFields.dueDate ? "secondary" : "outline"}
                                                                size="sm"
                                                                onClick={() => setPinnedFields(prev => ({ ...prev, dueDate: !prev.dueDate }))}
                                                                className="h-8 px-2 transition-colors hover:bg-gray-50"
                                                            >
                                                                Due Date
                                                            </Button>
                                                        )}
                                                        
                                                        {taskDetails?.status && (
                                                            <div className="relative dropdown-container">
                                                                <Button
                                                                    type="button"
                                                                    variant={pinnedFields.status ? "secondary" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => handleFieldPress('status')}
                                                                    className="h-8 px-2 flex items-center gap-1 transition-colors hover:bg-gray-50"
                                                                >
                                                                    Status
                                                                    <ChevronDown className="h-3 w-3" />
                                                                </Button>
                                                                
                                                                {/* Status Dropdown */}
                                                                {showStatusDropdown && (
                                                                    <div className="dropdown-container absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                                        <div className="p-1">
                                                                            <div className="text-xs text-gray-500 p-2">Select status:</div>
                                                                            {statusOptions.map((status) => (
                                                                                <button
                                                                                    key={status}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setPinnedFields(prev => ({ ...prev, status: true }));
                                                                                        setShowStatusDropdown(false);
                                                                                    }}
                                                                                    className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
                                                                                >
                                                                                    {status}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Submit Button */}
                                                <div className="flex justify-end pt-2">
                                                    <Button
                                                        type="submit"
                                                        variant="primary"
                                                        size="sm"
                                                        disabled={isPending || isUpdating || !content.trim()}
                                                    >
                                                        <Send className="h-4 w-4 mr-1" />
                                                        {isPending || isUpdating ? "Sending..." : "Comment"}
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }; 