import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const passwordSchema = z.string()
    .min(8, "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой")
    .regex(/[A-Z]/, "Дор хаяж нэг том үсэг орсон байх ёстой")
    .regex(/[a-z]/, "Дор хаяж нэг жижиг үсэг орсон байх ёстой")
    .regex(/[0-9]/, "Дор хаяж нэг тоо орсон байх ёстой")
    .regex(/[^A-Za-z0-9]/, "Дор хаяж нэг тусгай тэмдэгт орсон байх ёстой");

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Имэйл болон нууц үг оруулна уу" },
                { status: 400 }
            );
        }

        const passwordResult = passwordSchema.safeParse(password);
        if (!passwordResult.success) {
            return NextResponse.json(
                { error: passwordResult.error.issues[0].message },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Энэ имэйл бүртгэлтэй байна" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER", // Default role
            },
        });

        return NextResponse.json(
            { message: "User created successfully", user: { id: user.id, email: user.email } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
