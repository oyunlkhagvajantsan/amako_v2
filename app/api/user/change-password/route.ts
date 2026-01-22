import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Одоогийн нууц үг шаардлагатай"),
    newPassword: z.string().min(6, "Шинэ нууц үг дор хаяж 6 тэмдэгттэй байх ёстой"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const result = changePasswordSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = result.data;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Одоогийн нууц үг буруу байна" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: session.user.email },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password change error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
