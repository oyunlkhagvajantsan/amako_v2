"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats(period: number | null | { startDate: string; endDate: string }) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (typeof period === "number") {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        startDate.setHours(0, 0, 0, 0);
    } else if (period && typeof period === "object" && 'startDate' in period) {
        startDate = new Date(period.startDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(period.endDate);
        endDate.setHours(23, 59, 59, 999);
    }

    const dateFilter = startDate
        ? (endDate ? { gte: startDate, lte: endDate } : { gte: startDate })
        : undefined;

    const [
        incomeAgg, 
        followers, 
        activeUsers, 
        posts, 
        chapters, 
        comments, 
        viewsAgg, 
        pendingPayments,
        devicesGroup,
        browsersGroup,
        citiesGroup,
        referrersGroup,
        entryPathsGroup
    ] = await Promise.all([
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
        prisma.paymentRequest.count({ where: { status: "PENDING" } }),
        
        // Devices aggregation
        prisma.visitLog.groupBy({
            by: ["device"],
            where: { createdAt: dateFilter },
            _count: { id: true }
        }),
        
        // Browsers aggregation
        prisma.visitLog.groupBy({
            by: ["browser"],
            where: { createdAt: dateFilter },
            _count: { id: true }
        }),
        
        // Cities aggregation
        prisma.visitLog.groupBy({
            by: ["city"],
            where: { createdAt: dateFilter },
            _count: { id: true },
            orderBy: {
                _count: {
                    id: "desc"
                }
            },
            take: 10
        }),

        // Referrers aggregation
        prisma.visitLog.groupBy({
            by: ["referrer"],
            where: { createdAt: dateFilter },
            _count: { id: true },
            orderBy: {
                _count: {
                    id: "desc"
                }
            },
            take: 10
        }),

        // Entry Paths aggregation
        prisma.visitLog.groupBy({
            by: ["entryPath"],
            where: { createdAt: dateFilter },
            _count: { id: true },
            orderBy: {
                _count: {
                    id: "desc"
                }
            },
            take: 10
        })
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

    if (startDate && typeof period === "number" && period <= 30) {
        const now = new Date();
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            chartData.push({
                date: new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                views: map.get(dateStr) || 0
            });
        }
    } else if (startDate && endDate) {
        // If it's a custom date range (or month select), fill in the daily points between startDate and endDate
        // so that there are no empty gaps in the chart
        // Limit filling in 0s if the range is <= 62 days (roughly 2 months)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 62) {
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                chartData.push({
                    date: new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                    views: map.get(dateStr) || 0
                });
            }
        } else {
            chartData = metrics.map(m => ({
                date: new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                views: m._sum.count || 0
            }));
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
        chartData,
        analytics: {
            devices: devicesGroup.map(d => ({ name: d.device, count: d._count.id })),
            browsers: browsersGroup.map(b => ({ name: b.browser, count: b._count.id })),
            cities: citiesGroup.map(c => ({ name: c.city || "Unknown", count: c._count.id })),
            referrers: referrersGroup.map(r => ({ name: r.referrer || "Direct", count: r._count.id })),
            entryPaths: entryPathsGroup.map(e => ({ name: e.entryPath || "/", count: e._count.id }))
        }
    };
}
