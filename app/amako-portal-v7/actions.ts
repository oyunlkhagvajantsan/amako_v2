"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats(days: number | null) {
    const now = new Date();
    let startDate: Date | undefined;

    if (days !== null) {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
    }

    const dateFilter = startDate ? { gte: startDate } : undefined;

    const [incomeAgg, followers, activeUsers, posts, chapters, comments, viewsAgg, pendingPayments] = await Promise.all([
        prisma.paymentRequest.aggregate({
            where: { status: "APPROVED", createdAt: dateFilter },
            _sum: { amount: true }
        }),
        prisma.user.count(),
        prisma.user.count({ where: { isSubscribed: true } }),
        prisma.manga.count(),
        prisma.chapter.count(),
        prisma.comment.count(),
        prisma.dailyMetric.aggregate({
            where: { date: dateFilter },
            _sum: { count: true }
        }),
        prisma.paymentRequest.count({ where: { status: "PENDING" } })
    ]);

    // Graph Data
    let chartData: { date: string, views: number }[] = [];
    
    const metrics = await prisma.dailyMetric.groupBy({
        by: ['date'],
        where: { date: dateFilter },
        _sum: { count: true },
        orderBy: { date: 'asc' }
    });

    const map = new Map(metrics.map(m => [m.date.toISOString().split('T')[0], m._sum.count || 0]));

    if (startDate && days && days <= 30) {
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            chartData.push({
                date: new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                views: map.get(dateStr) || 0
            });
        }
    } else {
        // If > 30 days or all time, skip filling 0s to avoid enormous arrays, just map existing points
        chartData = metrics.map(m => ({
            date: new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            views: m._sum.count || 0
        }));
    }

    return {
        income: incomeAgg._sum.amount || 0,
        followers,
        activeUsers,
        posts,
        chapters,
        comments,
        pendingPayments,
        views: viewsAgg._sum.count || 0,
        chartData
    };
}
