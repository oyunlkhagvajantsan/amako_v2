import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Initialize Upstash Redis client
 */
const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Rate limiter for Commenting (strict)
 * 5 requests per 1 minute per IP
 */
export const commentRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/comments",
}) : null;

/**
 * Rate limiter for Auth (Login/Register)
 * 10 requests per 5 minutes per IP
 */
export const authRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "5 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
}) : null;

/**
 * General API Rate Limit (loose)
 * 100 requests per 1 minute per IP
 */
export const generalRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/api",
}) : null;
