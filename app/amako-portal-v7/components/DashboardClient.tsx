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
    const [period, setPeriod] = useState<number | null | { startDate: string; endDate: string }>(30);
    const [stats, setStats] = useState(initialData);
    const [loading, setLoading] = useState(false);

    // Admin Filter Mode: "period" | "month" | "custom"
    const [filterMode, setFilterMode] = useState<"period" | "month" | "custom">("period");

    // Month filter selection: e.g. "2026-05"
    const [selectedMonth, setSelectedMonth] = useState<string>("");

    // Custom range selection
    const [startDateStr, setStartDateStr] = useState<string>("");
    const [endDateStr, setEndDateStr] = useState<string>("");

    const getMonthsOptions = () => {
        const options = [];
        const now = new Date();
        const monthNames = [
            "1-р сар", "2-р сар", "3-р сар",
            "4-р сар", "5-р сар", "6-р сар",
            "7-р сар", "8-р сар", "9-р сар",
            "10-р сар", "11-р сар", "12-р сар"
        ];
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = d.getFullYear();
            const month = d.getMonth();
            options.push({
                label: `${monthNames[month]} ${year}`,
                value: `${year}-${String(month + 1).padStart(2, '0')}`
            });
        }
        return options;
    };

    const handleMonthChange = (monthStr: string) => {
        setSelectedMonth(monthStr);
        if (!monthStr) return;
        const [year, month] = monthStr.split("-").map(Number);
        // Start date: Year-Month-01
        const start = new Date(year, month - 1, 1);
        // End date: last day of the month
        const end = new Date(year, month, 0);

        setPeriod({
            startDate: start.toISOString(),
            endDate: end.toISOString()
        });
    };

    const handleCustomRangeSubmit = () => {
        if (!startDateStr || !endDateStr) return;
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);

        setPeriod({
            startDate: start.toISOString(),
            endDate: end.toISOString()
        });
    };

    const handleFilterModeChange = (mode: "period" | "month" | "custom") => {
        setFilterMode(mode);
        if (mode === "period") {
            setPeriod(30);
            setSelectedMonth("");
            setStartDateStr("");
            setEndDateStr("");
        } else if (mode === "month") {
            const months = getMonthsOptions();
            if (months.length > 0) {
                handleMonthChange(months[0].value);
            }
            setStartDateStr("");
            setEndDateStr("");
        } else if (mode === "custom") {
            setSelectedMonth("");
            const today = new Date();
            const past = new Date();
            past.setDate(today.getDate() - 30);

            const toStr = today.toISOString().split("T")[0];
            const fromStr = past.toISOString().split("T")[0];

            setStartDateStr(fromStr);
            setEndDateStr(toStr);
            setPeriod({
                startDate: past.toISOString(),
                endDate: today.toISOString()
            });
        }
    };

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-100 bg-gray-50/50 gap-4">
                    {/* Filter Mode Selector (Only for Admin) */}
                    {isAdmin ? (
                        <div className="flex bg-gray-200/65 rounded-lg p-0.5 self-start">
                            <button
                                onClick={() => handleFilterModeChange("period")}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filterMode === "period" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Хугацаагаар
                            </button>
                            <button
                                onClick={() => handleFilterModeChange("month")}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filterMode === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Сараар харах
                            </button>
                            <button
                                onClick={() => handleFilterModeChange("custom")}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${filterMode === "custom" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                Өдрөөр сонгох
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm font-semibold text-gray-700">Хугацааны шүүлтүүр</div>
                    )}

                    {/* Filter Inputs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {filterMode === "period" && (
                            <select
                                className="bg-transparent border-0 text-sm font-semibold text-gray-600 focus:ring-0 cursor-pointer"
                                value={period === null ? "all" : (typeof period === "number" ? period.toString() : "30")}
                                onChange={(e) => setPeriod(e.target.value === "all" ? null : parseInt(e.target.value))}
                                disabled={loading}
                            >
                                <option value="1">1 хоног</option>
                                <option value="7">7 хоног</option>
                                <option value="30">1 сар</option>
                                <option value="90">3 сар </option>
                                <option value="180">6 сар</option>
                                <option value="365">12 сар</option>
                                <option value="all">Нийт</option>
                            </select>
                        )}

                        {filterMode === "month" && (
                            <select
                                className="bg-transparent border-0 text-sm font-semibold text-gray-600 focus:ring-0 cursor-pointer"
                                value={selectedMonth}
                                onChange={(e) => handleMonthChange(e.target.value)}
                                disabled={loading}
                            >
                                {getMonthsOptions().map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        )}

                        {filterMode === "custom" && (
                            <div className="flex items-center gap-2 text-sm">
                                <input
                                    type="date"
                                    className="bg-white border border-gray-300 rounded-md text-xs text-gray-600 focus:ring-teal-500 focus:border-teal-500 px-2 py-1"
                                    value={startDateStr}
                                    onChange={(e) => setStartDateStr(e.target.value)}
                                    disabled={loading}
                                />
                                <span className="text-gray-400 font-medium text-xs">хүртэл</span>
                                <input
                                    type="date"
                                    className="bg-white border border-gray-300 rounded-md text-xs text-gray-600 focus:ring-teal-500 focus:border-teal-500 px-2 py-1"
                                    value={endDateStr}
                                    onChange={(e) => setEndDateStr(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    onClick={handleCustomRangeSubmit}
                                    disabled={loading || !startDateStr || !endDateStr}
                                    className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-semibold text-xs py-1 px-3 rounded-md transition-colors"
                                >
                                    Шүүх
                                </button>
                            </div>
                        )}
                    </div>
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

            {/* User Analytics Statistics */}
            {stats.analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Devices & Browsers */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Device</h3>
                            <div className="space-y-4">
                                {(() => {
                                    const total = stats.analytics.devices.reduce((acc: number, cur: any) => acc + cur.count, 0) || 1;
                                    return stats.analytics.devices.map((device: any) => {
                                        const percentage = Math.round((device.count / total) * 100);
                                        return (
                                            <div key={device.name} className="space-y-1">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-gray-700">{device.name}</span>
                                                    <span className="text-gray-900">{device.count.toLocaleString()} ({percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-teal-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                                {stats.analytics.devices.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Өгөгдөл байхгүй байна.</p>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Browser</h3>
                            <div className="space-y-4">
                                {(() => {
                                    const total = stats.analytics.browsers.reduce((acc: number, cur: any) => acc + cur.count, 0) || 1;
                                    return stats.analytics.browsers.map((browser: any) => {
                                        const percentage = Math.round((browser.count / total) * 100);
                                        return (
                                            <div key={browser.name} className="space-y-1">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-gray-700">{browser.name}</span>
                                                    <span className="text-gray-900">{browser.count.toLocaleString()} ({percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                                {stats.analytics.browsers.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Өгөгдөл байхгүй байна.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Cities, Referrers, Landing Pages */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">User cities</h3>
                            <div className="space-y-3">
                                {stats.analytics.cities.slice(0, 5).map((city: any, i: number) => (
                                    <div key={city.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 text-xs font-semibold text-gray-400">#{i + 1}</span>
                                            <span className="text-gray-700 font-medium">{city.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{city.count.toLocaleString()}</span>
                                    </div>
                                ))}
                                {stats.analytics.cities.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Өгөгдөл байхгүй байна.</p>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Referrer</h3>
                            <div className="space-y-3">
                                {stats.analytics.referrers.slice(0, 5).map((ref: any, i: number) => (
                                    <div key={ref.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 text-xs font-semibold text-gray-400">#{i + 1}</span>
                                            <span className="text-gray-700 font-medium truncate max-w-[200px]">{ref.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">{ref.count.toLocaleString()}</span>
                                    </div>
                                ))}
                                {stats.analytics.referrers.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Өгөгдөл байхгүй байна.</p>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Entry path</h3>
                            <div className="space-y-3">
                                {stats.analytics.entryPaths.slice(0, 5).map((path: any, i: number) => (
                                    <div key={path.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                                            <span className="w-5 flex-shrink-0 text-xs font-semibold text-gray-400">#{i + 1}</span>
                                            <span className="text-gray-700 font-medium truncate" title={path.name}>{path.name}</span>
                                        </div>
                                        <span className="font-semibold text-gray-900 flex-shrink-0">{path.count.toLocaleString()}</span>
                                    </div>
                                ))}
                                {stats.analytics.entryPaths.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Өгөгдөл байхгүй байна.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
