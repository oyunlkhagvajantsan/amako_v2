import { NextRequest, NextResponse } from "next/server";
import { commentRateLimit, authRateLimit, generalRateLimit } from "@/lib/rate-limit";

export async function handleRateLimiting(req: NextRequest, ip: string, path: string) {
    if (!path.startsWith('/api')) return null;

    const isRateLimitConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!isRateLimitConfigured) return null;

    try {
        let limitResult;
        const method = req.method;

        if (path.includes('/comments') && method === 'POST') {
            limitResult = await commentRateLimit?.limit(ip);
        } else if (path.includes('/auth') || path.includes('/user/verify-age')) {
            limitResult = await authRateLimit?.limit(ip);
        } else if (method !== 'GET') {
            limitResult = await generalRateLimit?.limit(ip);
        }

        if (limitResult && !limitResult.success) {
            return NextResponse.json(
                { error: 'Too Many Requests', details: 'Та хэтэрхий олон хүсэлт илгээсэн байна. Түр хүлээгээд дахин оролдоно уу.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': limitResult.limit.toString(),
                        'X-RateLimit-Remaining': limitResult.remaining.toString(),
                        'X-RateLimit-Reset': limitResult.reset.toString(),
                    }
                }
            );
        }
    } catch (err) {
        console.error("Rate limiting failed:", err);
    }

    return null;
}
