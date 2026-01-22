import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists or not
            return NextResponse.json({ message: "If an account exists, a code has been sent." });
        }

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await prisma.verificationCode.create({
            data: {
                email,
                code,
                expiresAt,
                type: "RESET_PASSWORD",
            },
        });

        // DEV: Log code to console for testing without email
        if (process.env.NODE_ENV === "development") {
            console.log("==================================");
            console.log(`🔑 RESET PASSWORD CODE for ${email}: ${code}`);
            console.log("==================================");
        }

        try {
            // Send email
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Amako" <noreply@amako.com>',
                to: email,
                subject: "Amako - Password Reset Code",
                text: `Your password reset code is: ${code}. It expires in 15 minutes.`,
                html: `<p>Your password reset code is: <strong>${code}</strong></p><p>It expires in 15 minutes.</p>`,
            });
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // In development, we allow proceeding even if email fails
            if (process.env.NODE_ENV !== "development") {
                throw emailError;
            }
        }

        return NextResponse.json({ message: "Code sent" });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
