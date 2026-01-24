import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * API to permanently verify user age (18+)
 * Only for authenticated users
 */
export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        console.log("[VerifyAgeAPI] Session found:", {
            id: session?.user?.id,
            email: session?.user?.email,
            hasSession: !!session
        });

        if (!session?.user?.id) {
            console.error("[VerifyAgeAPI] No user ID in session");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[VerifyAgeAPI] Attempting DB update for user:", session.user.id);

        // Use any to bypass type sync errors if the client is stubborn
        // This ensures the DB actually gets updated even if types are lagging
        const updatedUser = await (prisma.user as any).update({
            where: { id: session.user.id },
            data: { ageVerified: true }
        });

        console.log("[VerifyAgeAPI] DB update successful:", updatedUser?.email, { ageVerified: updatedUser?.ageVerified });

        return NextResponse.json({
            success: true,
            message: "Age verified successfully",
            ageVerified: updatedUser?.ageVerified
        });
    } catch (error: any) {
        console.error("Age verification API error:", error);
        return NextResponse.json({ error: "Failed to verify age", details: error.message }, { status: 500 });
    }
}
