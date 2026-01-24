"use client";

import { useState } from "react";
import { ThumbsUp, MessageSquare, Trash2, EyeOff, Eye, MoreVertical } from "lucide-react";
import { useSession } from "next-auth/react";
import CommentInput from "./CommentInput";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface CommentUser {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
}

interface CommentData {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    mangaId: number;
    chapterId?: number | null;
    isHidden: boolean;
    user: CommentUser;
    likes: { userId: string }[];
    _count: {
        likes: number;
        replies?: number;
    };
    replies?: CommentData[];
    isOptimistic?: boolean;
}

interface CommentItemProps {
    comment: CommentData;
    mangaId: number;
    onRefresh: () => void;
    isReply?: boolean;
}

export default function CommentItem({ comment, mangaId, onRefresh, isReply }: CommentItemProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [isReplying, setIsReplying] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
    const isLikedByMe = comment.likes?.length > 0;
    const isMyComment = session?.user?.id === comment.userId;

    const queryKey = ["comments", mangaId, comment.chapterId];

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
            if (!res.ok) throw new Error("Like failed");
            return res.json();
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey });
            const previousComments = queryClient.getQueryData(queryKey);

            // Optimistically update the like count
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;
                return old.map((c: any) => {
                    const updateComment = (target: any) => {
                        if (target.id === comment.id) {
                            const alreadyLiked = target.likes?.length > 0;
                            return {
                                ...target,
                                likes: alreadyLiked ? [] : [{ userId: session?.user?.id }],
                                _count: {
                                    ...target._count,
                                    likes: alreadyLiked ? Math.max(0, target._count.likes - 1) : target._count.likes + 1
                                }
                            };
                        }
                        if (target.replies) {
                            return { ...target, replies: target.replies.map(updateComment) };
                        }
                        return target;
                    };
                    return updateComment(c);
                });
            });

            return { previousComments };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(queryKey, context?.previousComments);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Reply mutation
    const replyMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await fetch(`/api/comments/${comment.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, mangaId, chapterId: comment.chapterId })
            });
            if (!res.ok) throw new Error("Reply failed");
            return res.json();
        },
        onSuccess: () => {
            setIsReplying(false);
            setShowReplies(true);
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // Moderate mutation
    const moderateMutation = useMutation({
        mutationFn: async ({ action, isHidden }: { action: "hide" | "delete", isHidden?: boolean }) => {
            if (action === "hide") {
                const res = await fetch(`/api/comments/${comment.id}/moderate`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isHidden })
                });
                if (!res.ok) throw new Error("Moderate failed");
            } else {
                const res = await fetch(`/api/comments/${comment.id}/moderate`, { method: "DELETE" });
                if (!res.ok) throw new Error("Delete failed");
            }
        },
        onSuccess: () => {
            setIsMenuOpen(false);
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const handleLike = () => {
        if (!session) return;
        likeMutation.mutate();
    };

    const handleReply = async (content: string) => {
        replyMutation.mutate(content);
    };

    const handleModerate = async (action: "hide" | "delete") => {
        if (action === "hide") {
            moderateMutation.mutate({ action, isHidden: !comment.isHidden });
        } else {
            if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
            moderateMutation.mutate({ action });
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("mn-MN", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className={`group/item ${isReply ? "mt-4 ml-6 pl-6 border-l-2 border-gray-100" : "mb-8"}`}>
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm overflow-hidden">
                        {comment.user.image ? (
                            <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold text-gray-500 uppercase">{comment.user.name?.[0] || "?"}</span>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow min-w-0">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${comment.user.role === "ADMIN" ? "text-[#d8454f]" : "text-gray-900"}`}>
                                    {comment.user.name || "Гишүүн"}
                                </span>
                                {comment.user.role === "ADMIN" && (
                                    <span className="bg-[#d8454f]/10 text-[#d8454f] text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#d8454f]/10">Админ</span>
                                )}
                                <span className="text-[11px] text-gray-400 font-medium">{formatDate(comment.createdAt)}</span>
                            </div>

                            {/* Options Menu (Admin or Owner) */}
                            {(isAdmin || isMyComment) && (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleModerate("hide")}
                                                    className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
                                                >
                                                    {comment.isHidden ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-amber-500" />}
                                                    {comment.isHidden ? "Ил болгох" : "Нуух"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleModerate("delete")}
                                                disabled={moderateMutation.isPending}
                                                className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-500 flex items-center gap-2 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={14} className={moderateMutation.isPending ? "animate-spin" : ""} />
                                                Устгах
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <p className={`text-[14px] leading-relaxed ${comment.isHidden ? "italic text-gray-300 line-through" : "text-gray-700"}`}>
                            {comment.content}
                        </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-5 mt-2.5 px-1">
                        <button
                            onClick={handleLike}
                            disabled={likeMutation.isPending}
                            className={`flex items-center gap-1.5 text-[12px] font-bold transition-all ${isLikedByMe ? "text-[#d8454f]" : "text-gray-400 hover:text-[#d8454f]"} disabled:opacity-50`}
                        >
                            <div className={`p-1.5 rounded-lg transition-colors ${isLikedByMe ? "bg-[#d8454f]/10" : "group-hover:bg-gray-100"}`}>
                                <ThumbsUp size={14} fill={isLikedByMe ? "currentColor" : "none"} className={likeMutation.isPending ? "animate-pulse" : ""} />
                            </div>
                            {comment._count.likes > 0 && <span>{comment._count.likes}</span>}
                        </button>

                        {!isReply && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className={`flex items-center gap-1.5 text-[12px] font-bold transition-all ${isReplying ? "text-[#d8454f]" : "text-gray-400 hover:text-gray-900"}`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isReplying ? "bg-[#d8454f]/10" : "group-hover:bg-gray-100"}`}>
                                    <MessageSquare size={14} />
                                </div>
                                <span>Хариулах</span>
                            </button>
                        )}

                        {!isReply && comment.replies && comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-[11px] font-bold text-gray-400 hover:text-[#d8454f] transition-all ml-auto flex items-center gap-1.5 bg-gray-50 hover:bg-[#d8454f]/5 px-3 py-1.5 rounded-full"
                            >
                                {showReplies ? "Хариуг нуух" : `Хариуг харах (${comment.replies.length})`}
                            </button>
                        )}
                    </div>

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <CommentInput
                                onSubmit={handleReply}
                                isReply
                                onCancel={() => setIsReplying(false)}
                                initialValue={`@${comment.user.name} `}
                                placeholder={`${comment.user.name}-д хариулах...`}
                                isLoading={replyMutation.isPending}
                            />
                        </div>
                    )}

                    {/* Nested Replies */}
                    {showReplies && comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            {comment.replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    mangaId={mangaId}
                                    onRefresh={() => { }} // Removed since we use Query invalidation
                                    isReply
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

