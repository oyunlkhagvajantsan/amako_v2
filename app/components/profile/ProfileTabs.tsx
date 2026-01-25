"use client";

import { useState } from "react";
import { BookOpen, Heart, CreditCard, Settings, User as UserIcon, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ChangePasswordForm from "@/app/profile/ChangePasswordForm";
import { UserFull } from "@/lib/types";
import { signOut } from "next-auth/react";

interface ProfileTabsProps {
    user: UserFull;
    isSubscribed: boolean;
    daysLeft: number;
}

type TabType = "history" | "liked" | "payments" | "settings";

export default function ProfileTabs({ user, isSubscribed, daysLeft }: ProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("history");

    const tabs = [
        { id: "history", label: "Уншсан", icon: BookOpen },
        { id: "liked", label: "Таалагдсан", icon: Heart },
        { id: "payments", label: "Түүх", icon: CreditCard },
        { id: "settings", label: "Тохиргоо", icon: Settings },
    ];

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-[#d8454f] border border-gray-100 shadow-inner">
                            <UserIcon size={48} />
                        </div>
                        <div className="text-center md:text-left flex-grow">
                            <h2 className="text-2xl font-black text-gray-900 mb-1">{user.name}</h2>
                            <p className="text-gray-500 font-medium mb-4">{user.email}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                {isSubscribed ? (
                                    <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Идэвхтэй ({daysLeft} хоног)
                                    </div>
                                ) : (
                                    <div className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-bold border border-gray-200">
                                        Идэвхгүй
                                    </div>
                                )}
                                <button
                                    onClick={() => signOut()}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full text-sm font-bold transition-all border border-transparent hover:border-red-100"
                                >
                                    <LogOut size={16} /> Гарах
                                </button>
                            </div>
                        </div>
                        {!isSubscribed && (
                            <Link
                                href="/subscribe"
                                className="w-full md:w-auto px-8 py-3 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95 text-center"
                            >
                                Эрх авах
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                            ? "bg-white text-[#d8454f] shadow-sm ring-1 ring-black/5"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300">
                {activeTab === "history" && (
                    <div className="grid gap-3">
                        {user.readHistory.length === 0 ? (
                            <EmptyState icon={BookOpen} message="Уншсан түүх байхгүй байна." />
                        ) : (
                            user.readHistory.map((history) => (
                                <Link
                                    key={history.id}
                                    href={`/manga/${history.chapter?.mangaId}/read/${history.chapterId}`}
                                    className="group flex items-center gap-4 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                                >
                                    <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                                        <Image
                                            src={history.chapter.manga.coverImage}
                                            alt={history.chapter.manga.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h4 className="font-black text-gray-900 line-clamp-1 group-hover:text-[#d8454f] transition-colors">
                                            {history.chapter?.manga?.titleMn || history.chapter?.manga?.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {history.chapter?.chapterNumber}-р бүлэг
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                                            {new Date(history.updatedAt).toLocaleDateString("mn-MN")}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "liked" && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {user.likes.length === 0 ? (
                            <div className="col-span-full">
                                <EmptyState icon={Heart} message="Таалагдсан гаргалт байхгүй байна." />
                            </div>
                        ) : (
                            user.likes.map((like) => (
                                <Link
                                    key={like.id}
                                    href={`/manga/${like.mangaId}`}
                                    className="group block space-y-3"
                                >
                                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 transition-all group-hover:shadow-xl group-hover:scale-105">
                                        <Image
                                            src={like.manga.coverImage}
                                            alt={like.manga.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                            <div className="flex items-center gap-1.5 text-white">
                                                <Heart size={12} className="fill-[#d8454f] text-[#d8454f]" />
                                                <span className="text-[10px] font-black">{like.manga.likeCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 px-1 group-hover:text-[#d8454f] transition-colors leading-snug">
                                        {like.manga.titleMn || like.manga.title}
                                    </h4>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "payments" && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        {user.paymentRequests.length === 0 ? (
                            <EmptyState icon={CreditCard} message="Гүйлгээний түүх байхгүй байна." />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Хугацаа</th>
                                            <th className="px-6 py-4 text-right">Дүн</th>
                                            <th className="px-6 py-4 text-center">Төлөв</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 font-medium">
                                        {user.paymentRequests.map((req) => (
                                            <tr key={req.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-gray-900">{req.months} сар</div>
                                                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-gray-900">
                                                    {req.amount.toLocaleString()}₮
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${req.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                        req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                            "bg-yellow-100 text-yellow-700"
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 mb-2">Нууц үг солих</h3>
                            <ChangePasswordForm />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 grayscale-[0.5] opacity-60">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 ring-8 ring-gray-50/50">
                <Icon size={32} />
            </div>
            <p className="text-gray-500 font-bold">{message}</p>
        </div>
    );
}
