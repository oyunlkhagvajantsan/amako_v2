import { NextResponse } from "next/server";

export function getSecurityHeaders() {
    // Generate a secure nonce for CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' blob: data: https://*.r2.cloudflarestorage.com https://*.r2.dev https://pub-8d40e7b5f4434dd0b16914d27a759084.r2.dev;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' http://localhost:* ws://localhost:* https://*.upstash.io;
        frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim();

    return {
        'Content-Security-Policy': cspHeader,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-DNS-Prefetch-Control': 'on'
    };
}

export function applySecurityHeaders(response: NextResponse) {
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}
