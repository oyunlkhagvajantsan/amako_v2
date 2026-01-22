import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PRICING, getPrice } from "@/lib/pricing";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const monthsStr = formData.get("months") as string;
        const months = monthsStr ? parseInt(monthsStr) : 1;

        // Get price from centralized config
        const amount = getPrice(months);

        // Image is skipped for now as per user request
        const imageUrl = "/placeholder-payment.png";

        const paymentRequest = await prisma.paymentRequest.create({
            data: {
                userId: session.user.id,
                imageUrl,
                amount,
                months,
                status: "PENDING",
            },
        });

        return NextResponse.json(paymentRequest, { status: 201 });
    } catch (error) {
        console.error("Payment upload error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
