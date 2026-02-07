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
            return;
        }
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error("Fetch notifications error:", error);
        }
    }, [session]);

    useEffect(() => {
        fetchNotifications();
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
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isOpen ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground hover:bg-surface"}`}
                title="Мэдэгдэл"
            >
                <Bell size={20} className={unreadCount > 0 ? "animate-swing" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-background">
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
                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-surface-elevated border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
                            <h3 className="font-bold text-foreground">Мэдэгдэл</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAsRead()}
                                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                    <Check size={12} /> Бүгдийг уншсан
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-border">
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
                                            className={`p-4 flex gap-3 cursor-pointer transition-colors ${n.isRead ? "hover:bg-surface" : "bg-primary/5 hover:bg-primary/10"}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "REPLY" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"}`}>
                                                {n.type === "REPLY" ? <Inbox size={18} /> : <Check size={18} />}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className={`text-sm leading-snug ${n.isRead ? "text-muted" : "text-foreground font-medium"}`}>
                                                    {n.content}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] text-muted font-medium">{formatDate(n.createdAt)}</span>
                                                    {!n.isRead && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                                </div>
                                            </div>
                                            {n.link && (
                                                <ExternalLink size={14} className="text-muted/30 mt-1" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-muted/30">
                                    <Bell size={40} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Мэдэгдэл байхгүй байна.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

