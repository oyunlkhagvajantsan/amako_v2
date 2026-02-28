import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    console.log("[API/Forgot-Password] POST request received");
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
            // Send email using centralized utility
            const result = await sendEmail({
                to: email,
                subject: "Amako - Password Reset Code",
                text: `Your password reset code is: ${code}. It expires in 15 minutes.`,
                html: `<p>Your password reset code is: <strong>${code}</strong></p><p>It expires in 15 minutes.</p>`,
            });

            if (!result.success) {
                throw new Error(result.error || "Failed to send email");
            }
        } catch (emailError) {
            console.error("Forgot password email failed:", emailError);
            // In development, we allow proceeding even if email fails
            if (process.env.NODE_ENV !== "development") {
                throw emailError;
            }
        }

        return NextResponse.json({ message: "Code sent" });
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
