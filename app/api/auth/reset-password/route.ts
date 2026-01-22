import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // specific check for newest code for this email and type
        const verification = await prisma.verificationCode.findFirst({
            where: {
                email,
                code,
                type: "RESET_PASSWORD",
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!verification) {
            return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        // Delete used code (and potentially older ones for cleanup)
        await prisma.verificationCode.deleteMany({
            where: { email, type: "RESET_PASSWORD" },
        });

        return NextResponse.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
