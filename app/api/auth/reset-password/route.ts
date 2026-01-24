import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const passwordSchema = z.string()
    .min(8, "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой")
    .regex(/[A-Z]/, "Дор хаяж нэг том үсэг орсон байх ёстой")
    .regex(/[a-z]/, "Дор хаяж нэг жижиг үсэг орсон байх ёстой")
    .regex(/[0-9]/, "Дор хаяж нэг тоо орсон байх ёстой")
    .regex(/[^A-Za-z0-9]/, "Дор хаяж нэг тусгай тэмдэгт орсон байх ёстой");

export async function POST(req: Request) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const passwordResult = passwordSchema.safeParse(newPassword);
        if (!passwordResult.success) {
            return NextResponse.json(
                { error: passwordResult.error.issues[0].message },
                { status: 400 }
            );
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
