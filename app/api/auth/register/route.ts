import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate request body
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { email, password, username } = validation.data;

        // Check if email exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: "Энэ имэйл хаяг бүртгэлтэй байна" },
                { status: 400 }
            );
        }

        // Check if username exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            return NextResponse.json(
                { error: "Энэ хэрэглэгчийн нэр бүртгэлтэй байна" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: "USER", // Default role
            },
        });

        return NextResponse.json(
            { message: "User created successfully", user: { id: user.id, email: user.email, username: user.username } },
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
