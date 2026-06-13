import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseUserAgent } from "@/lib/utils/ua";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || null;

        // Extract client IP address
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] ||
                   req.headers.get("x-real-ip") ||
                   "127.0.0.1";

        // Extract User-Agent
        const userAgentStr = req.headers.get("user-agent") || "";
        const { device, os, browser } = parseUserAgent(userAgentStr);

        // Get body data (referrer and entryPath)
        let referrer = "Direct";
        let entryPath = "/";

        try {
            const body = await req.json();
            if (body.referrer) referrer = body.referrer;
            if (body.entryPath) entryPath = body.entryPath;
        } catch (_) {
            // No body or invalid json - fallback to defaults
        }

        // Perform GeoIP lookup if the IP is public (not loopback or local subnet)
        let city = "Local";
        let country = "Local";

        const isLocalIp = 
            ip === "127.0.0.1" || 
            ip === "::1" || 
            ip.startsWith("192.168.") || 
            ip.startsWith("10.") || 
            ip.startsWith("172.16.") || 
            ip.startsWith("172.17.") ||
            ip.startsWith("172.18.") ||
            ip.startsWith("172.19.") ||
            ip.startsWith("172.20.") ||
            ip.startsWith("172.21.") ||
            ip.startsWith("172.22.") ||
            ip.startsWith("172.23.") ||
            ip.startsWith("172.24.") ||
            ip.startsWith("172.25.") ||
            ip.startsWith("172.26.") ||
            ip.startsWith("172.27.") ||
            ip.startsWith("172.28.") ||
            ip.startsWith("172.29.") ||
            ip.startsWith("172.30.") ||
            ip.startsWith("172.31.");

        if (!isLocalIp) {
            try {
                // FreeIPAPI is fast and doesn't require keys
                const geoRes = await fetch(`https://freeipapi.com/api/json/${ip}`, {
                    signal: AbortSignal.timeout(2000)
                });
                if (geoRes.ok) {
                    const data = await geoRes.json();
                    city = data.cityName || "Unknown";
                    country = data.countryName || "Unknown";
                } else {
                    city = "Unknown";
                    country = "Unknown";
                }
            } catch (err) {
                console.error("GeoIP lookup failed:", err);
                city = "Unknown";
                country = "Unknown";
            }
        }

        // Clean up referrer string
        if (referrer && referrer.trim() !== "") {
            try {
                if (referrer.startsWith("http://") || referrer.startsWith("https://")) {
                    const url = new URL(referrer);
                    if (url.hostname.includes("amakomanga.com") || url.hostname.includes("localhost") || url.hostname.includes("lvh.me")) {
                        referrer = "Direct";
                    } else {
                        referrer = url.hostname.replace("www.", "");
                    }
                }
            } catch (_) {
                // Ignore parsing errors
            }
        } else {
            referrer = "Direct";
        }

        // Log the visit to database
        const visit = await prisma.visitLog.create({
            data: {
                userId,
                ipAddress: ip,
                browser,
                device,
                os,
                country,
                city,
                referrer,
                entryPath
            }
        });

        return NextResponse.json({ success: true, id: visit.id });
    } catch (err) {
        console.error("Error logging visit:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
