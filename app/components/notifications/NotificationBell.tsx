"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Check, ExternalLink, Inbox } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Notification {
    id: string;
    type: string;
    content: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!session) {
            console.log("NotificationBell: No session, skipping fetch.");
            return;
        }
        try {
            console.log("NotificationBell: Fetching notifications for user:", session.user.id);
            const res = await fetch("/api/notifications");
            console.log("NotificationBell: Fetch status:", res.status);
            if (res.ok) {
                const data = await res.json();
                console.log("NotificationBell: Fetched", data.length, "notifications.");
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
            } else {
                const error = await res.json();
                console.error("NotificationBell: Fetch failed", error);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        }
    }, [session]);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 5 seconds for testing
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id?: string) => {
        try {
            const res = await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error("Mark as read error:", error);
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

    if (!session) return null;

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-all duration-300 ${isOpen ? "bg-red-50 text-[#d8454f]" : "text-gray-600 hover:bg-gray-100"}`}
                title="Мэдэгдэл"
            >
                <Bell size={22} className={unreadCount > 0 ? "animate-swing" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#d8454f] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Мэдэгдэл</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAsRead()}
                                    className="text-[11px] font-bold text-[#d8454f] hover:underline flex items-center gap-1"
                                >
                                    <Check size={12} /> Бүгдийг уншсан
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => {
                                                if (!n.isRead) markAsRead(n.id);
                                                if (n.link) {
                                                    setIsOpen(false);
                                                    window.location.href = n.link;
                                                }
                                            }}
                                            className={`p-4 flex gap-3 cursor-pointer transition-colors ${n.isRead ? "hover:bg-gray-50" : "bg-red-50/30 hover:bg-red-50/50"}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "REPLY" ? "bg-blue-50 text-blue-500" : "bg-red-50 text-red-500"}`}>
                                                {n.type === "REPLY" ? <Inbox size={18} /> : <Check size={18} />}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className={`text-sm leading-snug ${n.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                                                    {n.content}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] text-gray-400 font-medium">{formatDate(n.createdAt)}</span>
                                                    {!n.isRead && <span className="w-1.5 h-1.5 bg-[#d8454f] rounded-full" />}
                                                </div>
                                            </div>
                                            {n.link && (
                                                <ExternalLink size={14} className="text-gray-300 mt-1" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-400">
                                    <Bell size={40} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Шинэ мэдэгдэл байхгүй байна.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
