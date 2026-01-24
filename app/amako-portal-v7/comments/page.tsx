"use client";

import { useState, useEffect } from "react";
import { Trash2, EyeOff, Eye, MessageSquare, Search, Filter } from "lucide-react";
import Image from "next/image";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    isHidden: boolean;
    user: {
        name: string | null;
        email: string;
    };
    manga: {
        titleMn: string;
        title: string;
    };
    chapter?: {
        chapterNumber: number;
    } | null;
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "hidden" | "visible">("all");

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/comments");
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Fetch admin comments error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const handleAction = async (commentId: string, action: "hide" | "delete", currentHidden?: boolean) => {
        try {
            if (action === "hide") {
                await fetch(`/api/comments/${commentId}/moderate`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isHidden: !currentHidden })
                });
            } else {
                if (!confirm("Are you sure you want to delete this comment?")) return;
                await fetch(`/api/comments/${commentId}/moderate`, { method: "DELETE" });
            }
            fetchComments();
        } catch (error) {
            console.error("Moderation action failed:", error);
        }
    };

    const filteredComments = comments.filter(c => {
        const matchesSearch =
            c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.manga.titleMn.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filter === "all" ||
            (filter === "hidden" && c.isHidden) ||
            (filter === "visible" && !c.isHidden);

        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("mn-MN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Сэтгэгдэл удирдах</h1>
                    <p className="text-sm text-gray-500">Бүх сэтгэгдлийг хянах болон зохицуулах</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Хайх..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none min-w-[240px]"
                        />
                    </div>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none"
                    >
                        <option value="all">Бүгд</option>
                        <option value="visible">Ил</option>
                        <option value="hidden">Нуусан</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#d8454f] rounded-full" />
                    <p className="mt-4 text-gray-500">Ачаалж байна...</p>
                </div>
            ) : filteredComments.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Хэрэглэгч</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Сэтгэгдэл</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Гаргалт</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Үйлдэл</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredComments.map((comment) => (
                                    <tr key={comment.id} className={`hover:bg-gray-50 transition-colors ${comment.isHidden ? 'bg-gray-50/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{comment.user.name || "Нэргүй"}</div>
                                            <div className="text-xs text-gray-500">{comment.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-sm text-gray-700 max-w-md line-clamp-2 ${comment.isHidden ? 'italic text-gray-400 line-through' : ''}`}>
                                                {comment.content}
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-1">{formatDate(comment.createdAt)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-[#d8454f]">{comment.manga.titleMn}</div>
                                            {comment.chapter && (
                                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                                    Бүлэг {comment.chapter.chapterNumber}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(comment.id, "hide", comment.isHidden)}
                                                    className={`p-2 rounded-lg transition-colors ${comment.isHidden ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    title={comment.isHidden ? "Ил болгох" : "Нуух"}
                                                >
                                                    {comment.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleAction(comment.id, "delete")}
                                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Устгах"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
                    <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">Сэтгэгдэл олдсонгүй.</p>
                </div>
            )}
        </div>
    );
}
