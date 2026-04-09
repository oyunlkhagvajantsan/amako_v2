"use client"

import React, { useState, useEffect } from "react";
import { Users, FileText, MessageSquare, Eye, Banknote } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from "../actions";

interface DashboardClientProps {
    initialData: any;
    topMangas: any[];
    isAdmin: boolean;
}

export default function DashboardClient({ initialData, topMangas, isAdmin }: DashboardClientProps) {
    const [period, setPeriod] = useState<number | null>(30);
    const [stats, setStats] = useState(initialData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchStats = async () => {
            setLoading(true);
            try {
                const newStats = await getDashboardStats(period);
                if (isMounted) setStats(newStats);
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchStats();
        return () => { isMounted = false; };
    }, [period]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Хяналтын самбар</h1>

            {/* Pending Payments Alert */}
            <a
                href="/amako-portal-v7/payments"
                className="flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${stats.pendingPayments > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Хүлээгдэж буй төлбөр</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">{stats.pendingPayments}</span>
                            {stats.pendingPayments > 0 && (
                                <span className="flex h-2 w-2 relative mt-1">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors pr-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
            </a>

            {/* Top Row - 5 Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden py-2">
                <div className="flex flex-col items-center py-4 px-4 border-b md:border-b-0 md:border-r border-gray-100 relative">
                    <Users className="w-5 h-5 text-gray-400 mb-2" />
                    <span className="text-2xl font-bold text-gray-900">{stats.followers}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Хэрэглэгч</span>
                </div>
                <div className="flex flex-col items-center py-4 px-4 border-b md:border-b-0 md:border-r border-gray-100 relative">
                    <Users className="w-5 h-5 text-teal-500 mb-2" />
                    <span className="text-2xl font-bold text-gray-900">{stats.activeUsers}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1 text-center line-clamp-1">Идэвхтэй хэрэглэгч</span>
                </div>
                <div className="flex flex-col items-center py-4 px-4 border-b md:border-b-0 md:border-r border-gray-100 relative">
                    <FileText className="w-5 h-5 text-gray-400 mb-2" />
                    <span className="text-2xl font-bold text-gray-900">{stats.posts}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Гаргалт</span>
                </div>
                <div className="flex flex-col items-center py-4 px-4 border-r border-gray-100 relative">
                    <FileText className="w-5 h-5 text-gray-400 mb-2" />
                    <span className="text-2xl font-bold text-gray-900">{stats.chapters}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Бүлэг</span>
                </div>
                <div className="flex flex-col items-center py-4 px-4 relative">
                    <MessageSquare className="w-5 h-5 text-gray-400 mb-2" />
                    <span className="text-2xl font-bold text-gray-900">{stats.comments}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">Сэтгэгдэл</span>
                </div>
            </div>

            {/* Middle Row with Filter */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex justify-end p-4 border-b border-gray-100 bg-gray-50/50">
                    <select
                        className="bg-transparent border-0 text-sm font-semibold text-gray-600 focus:ring-0 cursor-pointer"
                        value={period === null ? "all" : period.toString()}
                        onChange={(e) => setPeriod(e.target.value === "all" ? null : parseInt(e.target.value))}
                        disabled={loading}
                    >
                        <option value="1">Last 24 hours</option>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">3 Months</option>
                        <option value="180">6 Months</option>
                        <option value="365">Last 12 Months</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
                <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : ''} divide-y md:divide-y-0 md:divide-x divide-gray-100 py-4 transition-opacity duration-200`} style={{ opacity: loading ? 0.5 : 1 }}>
                    {isAdmin && (
                        <div className="flex flex-col items-center justify-center py-6 px-6">
                            <span className="text-[13px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">Total Income</span>
                            <div className="flex items-center gap-3 text-gray-700">
                                <span className="text-3xl font-black tracking-tight">{stats.income.toLocaleString()}₮</span>
                                <Banknote className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col items-center justify-center py-6 px-6">
                        <span className="text-[13px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">Total Views</span>
                        <div className="flex items-center gap-3 text-gray-700">
                            <span className="text-3xl font-black tracking-tight">{stats.views.toLocaleString()}</span>
                            <Eye className="w-5 h-5 text-gray-300" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Total Visits Chart */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 rounded-xl backdrop-blur-[1px]">
                        <div className="w-6 h-6 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-6">Total Visits</h3>

                <div className="h-[280px] w-full mt-4">
                    <p className="text-[11px] text-gray-400 mb-4 font-semibold uppercase tracking-wider">Views Over Time</p>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                                dy={15}
                                minTickGap={30}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                itemStyle={{ color: '#0ea5e9', fontWeight: 600 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="#14b8a6"
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 6, fill: '#14b8a6', stroke: 'white', strokeWidth: 2 }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top 10 Mangas */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Хамгийн их үзэлттэй 10 гаргалт</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Rank</th>
                                <th className="px-6 py-4 font-semibold">Manga</th>
                                <th className="px-6 py-4 font-semibold text-right">Views</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {topMangas?.map((manga: any, index: number) => (
                                <tr key={manga.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${index < 3 ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img src={manga.coverImage} alt={manga.title} className="w-12 h-16 rounded object-cover shadow-sm bg-gray-100" />
                                            <div>
                                                <div className="font-semibold text-gray-900">{manga.title}</div>
                                                <div className="text-xs text-gray-500">{manga.author || 'Unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-gray-900">{manga.viewCount.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
