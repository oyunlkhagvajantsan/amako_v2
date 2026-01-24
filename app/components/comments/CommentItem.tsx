"use client";

import { useState } from "react";
import { ThumbsUp, MessageSquare, Trash2, EyeOff, Eye, MoreVertical } from "lucide-react";
import { useSession } from "next-auth/react";
import CommentInput from "./CommentInput";

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
}

interface CommentItemProps {
    comment: CommentData;
    mangaId: number;
    onRefresh: () => void;
    isReply?: boolean;
}

export default function CommentItem({ comment, mangaId, onRefresh, isReply }: CommentItemProps) {
    const { data: session } = useSession();
    const [isReplying, setIsReplying] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";
    const isLikedByMe = comment.likes?.length > 0;
    const isMyComment = session?.user?.id === comment.userId;

    const handleLike = async () => {
        if (!session) return;
        try {
            const res = await fetch(`/api/comments/${comment.id}/like`, { method: "POST" });
            if (res.ok) onRefresh();
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    const handleReply = async (content: string) => {
        try {
            const res = await fetch(`/api/comments/${comment.id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, mangaId, chapterId: comment.chapterId })
            });
            if (res.ok) {
                setIsReplying(false);
                setShowReplies(true);
                onRefresh();
            }
        } catch (error) {
            console.error("Reply error:", error);
        }
    };

    const handleModerate = async (action: "hide" | "delete") => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            if (action === "hide") {
                await fetch(`/api/comments/${comment.id}/moderate`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isHidden: !comment.isHidden })
                });
            } else {
                if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
                await fetch(`/api/comments/${comment.id}/moderate`, { method: "DELETE" });
            }
            onRefresh();
        } catch (error) {
            console.error("Moderation error:", error);
        } finally {
            setIsLoading(false);
            setIsMenuOpen(false);
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
        <div className={`group/item ${isReply ? "mt-4 ml-4 pl-4 border-l border-gray-800/50" : "mb-6"}`}>
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-gray-400 border border-gray-700 shadow-inner">
                        {comment.user.image ? (
                            <img src={comment.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold uppercase">{comment.user.name?.[0] || "?"}</span>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow min-w-0">
                    <div className="bg-[#1e1e1e]/40 rounded-2xl p-4 border border-transparent hover:border-gray-800/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${comment.user.role === "ADMIN" ? "text-red-500" : "text-gray-200"}`}>
                                    {comment.user.name || "Гишүүн"}
                                </span>
                                {comment.user.role === "ADMIN" && (
                                    <span className="bg-red-900/30 text-red-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-red-500/20">Админ</span>
                                )}
                                <span className="text-[10px] text-gray-500 font-medium">{formatDate(comment.createdAt)}</span>
                            </div>

                            {/* Options Menu (Admin or Owner) */}
                            {(isAdmin || isMyComment) && (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="p-1 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-colors"
                                    >
                                        <MoreVertical size={16} />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-1 w-36 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-10 py-1 animate-in fade-in zoom-in-95 duration-100">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleModerate("hide")}
                                                    className="w-full text-left px-4 py-2 text-xs hover:bg-gray-900 flex items-center gap-2 transition-colors"
                                                >
                                                    {comment.isHidden ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-yellow-500" />}
                                                    {comment.isHidden ? "Ил болгох" : "Нуух"}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleModerate("delete")}
                                                className="w-full text-left px-4 py-2 text-xs hover:bg-red-900/40 text-red-400 flex items-center gap-2 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Устгах
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <p className={`text-[13px] leading-relaxed ${comment.isHidden ? "italic text-gray-600 line-through opacity-50" : "text-gray-300"}`}>
                            {comment.content}
                        </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-4 mt-2 px-2">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 text-xs font-bold transition-all ${isLikedByMe ? "text-[#d8454f]" : "text-gray-500 hover:text-red-400"}`}
                        >
                            <ThumbsUp size={13} fill={isLikedByMe ? "currentColor" : "none"} />
                            {comment._count.likes > 0 && <span>{comment._count.likes}</span>}
                        </button>

                        {!isReply && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className={`flex items-center gap-1.5 text-xs font-bold transition-all ${isReplying ? "text-[#d8454f]" : "text-gray-500 hover:text-white"}`}
                            >
                                <MessageSquare size={13} />
                                <span>Хариулах</span>
                            </button>
                        )}

                        {!isReply && comment.replies && comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-[11px] font-bold text-gray-500 hover:text-[#d8454f] transition-all ml-auto flex items-center gap-1"
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
                                    onRefresh={onRefresh}
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

