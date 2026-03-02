import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import Image from "next/image";
import Link from "next/link";
import { PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

import { recordAuditAction } from "@/lib/audit";

import { PRICING, getPrice } from "@/lib/pricing";

import { ManualExtensionForm } from "./components/ManualExtensionForm";

async function manualApproveSubscription(prevState: any, formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
        return { success: false, message: "Unauthorized" };
    }

    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const monthsStr = formData.get("months") as string;
    const months = monthsStr ? parseInt(monthsStr) : 1;

    if (!email) return { success: false, message: "Email is required" };

    console.log("*** MANUAL APPROVE STARTED ***");

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Find User
            const user = await tx.user.findUnique({
                where: { email },
                select: { id: true, subscriptionEnd: true, email: true, username: true }
            });

            if (!user) throw new Error(`User with email ${email} not found.`);

            // 2. Calculate End Date
            let startDate = new Date();
            if (user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()) {
                startDate = new Date(user.subscriptionEnd);
            }

            const newEndDate = new Date(startDate);
            newEndDate.setDate(newEndDate.getDate() + (30 * months));

            // 3. Create Payment Request Record (Auto-Approved)
            const amount = getPrice(months);
            const paymentRequest = await tx.paymentRequest.create({
                data: {
                    userId: user.id,
                    amount,
                    months,
                    status: "APPROVED",
                    imageUrl: "/manual-add.png", // Placeholder for manual entries
                }
            });

            // 4. Update User
            await tx.user.update({
                where: { id: user.id },
                data: {
                    isSubscribed: true,
                    subscriptionEnd: newEndDate,
                },
            });

            // 5. Audit Log
            await recordAuditAction({
                userId: session.user.id,
                action: "APPROVE_PAYMENT",
                targetType: "PAYMENT_REQUEST",
                targetId: paymentRequest.id,
                details: {
                    type: "MANUAL_ADD",
                    targetUserEmail: email,
                    months,
                    newEndDate: newEndDate.toISOString()
                }
            }, tx);

            // 6. Create Notification
            await tx.notification.create({
                data: {
                    userId: user.id,
                    type: "SYSTEM",
                    content: `Админ таны ${months} сарын эрхийг сунгалаа. Дуусах хугацаа: ${newEndDate.toLocaleDateString("mn-MN")}`,
                    link: "/profile",
                },
            });

            // 7. Send Email (ROLLBACK ON FAILURE)
            const subject = "Amako - Subscription Extended (Эрх сунгагдлаа)";
            const text = `Hi ${user.username || 'User'}, your subscription has been manually extended for ${months} month(s)! It expires on ${newEndDate.toLocaleDateString("mn-MN")}.`;
            const html = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #d8454f;">Амжилттай!</h2>
                    <p>Сайн байна уу? Админ таны <strong>${months}</strong> сарын эрхийг сунгалаа.</p>
                    <p>Эрх дуусах хугацаа: <strong>${newEndDate.toLocaleDateString("mn-MN")}</strong></p>
                    <p>Та <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXTAUTH_URL}/profile" style="color: #d8454f; font-weight: bold;">профайл</a> хэсгээс дэлгэрэнгүйг харна уу.</p>
                </div>
            `;

            console.log(`[Manual Approve] Sending confirmation to: ${user.email}`);
            const emailResult = await sendEmail({ to: user.email, subject, text, html });

            if (!emailResult.success) {
                throw new Error(`Email delivery failed: ${emailResult.error}. Changes rolled back.`);
            }
        });

        revalidatePath("/amako-portal-v7/payments");
        return { success: true, message: `Successfully extended subscription for ${email} by ${months} month(s)!` };
    } catch (error: any) {
        console.error("*** MANUAL APPROVE FAILED ***", error.message);
        return { success: false, message: error.message };
    }
}

async function approvePayment(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return;

    console.log("*** SERVER ACTION APPROVE STARTED (ATOMIC) ***");
    const id = formData.get("id") as string;
    const userId = formData.get("userId") as string;
    const monthsStr = formData.get("months") as string;
    const months = monthsStr ? parseInt(monthsStr) : 1;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update Payment Status
            await tx.paymentRequest.update({
                where: { id },
                data: { status: "APPROVED" },
            });

            // 2. Update User Subscription
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { subscriptionEnd: true, email: true, username: true }
            });

            if (!user) throw new Error("User not found");

            let startDate = new Date();
            if (user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()) {
                startDate = new Date(user.subscriptionEnd);
            }

            const newEndDate = new Date(startDate);
            const daysToAdd = 30 * months;
            newEndDate.setDate(newEndDate.getDate() + daysToAdd);

            await tx.user.update({
                where: { id: userId },
                data: {
                    isSubscribed: true,
                    subscriptionEnd: newEndDate,
                },
            });

            // 3. Audit Log (Passing tx client)
            await recordAuditAction({
                userId: session.user.id,
                action: "APPROVE_PAYMENT",
                targetType: "PAYMENT_REQUEST",
                targetId: id,
                details: { targetUserId: userId, months, newEndDate: newEndDate.toISOString() }
            }, tx);

            // 4. Create Notification for User
            await tx.notification.create({
                data: {
                    userId,
                    type: "SYSTEM",
                    content: `Таны ${months} сарын эрх авах хүсэлт амжилттай батлагдлаа. Эрх дуусах хугацаа: ${newEndDate.toLocaleDateString("mn-MN")}`,
                    link: "/profile",
                },
            });

            // 5. Send Email to User (WITHIN TRANSACTION - ROLLBACK ON FAILURE)
            if (user.email) {
                const subject = "Amako - Subscription Approved (Эрх сунгагдлаа)";
                const text = `Hi ${user.username || 'User'}, your subscription for ${months} month(s) has been approved! It will end on ${newEndDate.toLocaleDateString("mn-MN")}.`;
                const html = `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #d8454f;">Амжилттай!</h2>
                        <p>Сайн байна уу? Таны <strong>${months}</strong> сарын эрх авах хүсэлт амжилттай батлагдлаа.</p>
                        <p>Эрх дуусах хугацаа: <strong>${newEndDate.toLocaleDateString("mn-MN")}</strong></p>
                        <p>Та <a href="${process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.NEXTAUTH_URL}/profile" style="color: #d8454f; font-weight: bold;">профайл</a> хэсгээс дэлгэрэнгүйг харна уу.</p>
                    </div>
                `;

                console.log(`[Approve Payment] Sending critical email to: ${user.email}`);
                const emailResult = await sendEmail({ to: user.email, subject, text, html });

                if (!emailResult.success) {
                    console.error(`[Approve Payment] Email failed: ${emailResult.error}. ROLLING BACK transaction.`);
                    throw new Error(`Email delivery failed: ${emailResult.error}. Subscription not extended.`);
                }
                console.log(`[Approve Payment] Email sent successfully. Transaction committing.`);
            } else {
                console.warn(`[Approve Payment] No email found for user ${userId}. Proceeding without email.`);
            }
        });

        revalidatePath("/amako-portal-v7/payments");
        console.log("*** SERVER ACTION APPROVE FINISHED (SUCCESS) ***");
    } catch (error: any) {
        console.error("*** SERVER ACTION APPROVE FAILED (ROLLED BACK) ***", error.message);
        // You might want to pass this error back to the UI or toast it
        // For now, re-throwing or handling via revalidate is common in Server Actions
        throw error;
    }
}

async function rejectPayment(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) return;

    console.log("*** SERVER ACTION REJECT STARTED ***");
    const id = formData.get("id") as string;
    console.log("Rejecting payment request:", id);

    // 1. Get Payment Request details
    const paymentRequest = await prisma.paymentRequest.findUnique({
        where: { id },
        select: { userId: true, months: true }
    });

    if (!paymentRequest) {
        console.error("Payment request not found for id:", id);
        return;
    }
    console.log("Found payment request:", paymentRequest);

    try {
        // 2. Update Status
        await prisma.paymentRequest.update({
            where: { id },
            data: { status: "REJECTED" },
        });
        console.log("Payment status updated to REJECTED");

        // Audit Log
        await recordAuditAction({
            userId: session.user.id,
            action: "REJECT_PAYMENT",
            targetType: "PAYMENT_REQUEST",
            targetId: id,
            details: { targetUserId: paymentRequest.userId }
        });

        // 3. Create Notification
        const notif = await prisma.notification.create({
            data: {
                userId: paymentRequest.userId,
                type: "SYSTEM",
                content: `Таны ${paymentRequest.months} сарын эрх авах хүсэлт амжилтгүй боллоо. Чатаар лавлана уу.`,
                link: "/profile",
            },
        });
        console.log("Notification created:", notif);
    } catch (error) {
        console.error("Error rejecting payment:", error);
    }

    revalidatePath("/amako-portal-v7/payments");
    console.log("*** SERVER ACTION REJECT FINISHED ***");
}

async function deletePayment(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return;

    console.log("*** SERVER ACTION DELETE STARTED ***");
    const id = formData.get("id") as string;

    // Audit Log (Before delete because we need targetId)
    await recordAuditAction({
        userId: session.user.id,
        action: "DELETE_PAYMENT",
        targetType: "PAYMENT_REQUEST",
        targetId: id
    });

    await prisma.paymentRequest.delete({
        where: { id },
    });

    revalidatePath("/amako-portal-v7/payments");
    console.log("*** SERVER ACTION DELETE FINISHED ***");
}

export default async function PaymentRequestsPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    const requests = await prisma.paymentRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { username: true, email: true }
            }
        }
    });

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Төлбөрийн хүсэлтүүд</h1>

            <ManualExtensionForm action={manualApproveSubscription} />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Months</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Хүсэлт ирээгүй байна.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{req.user.email}</div>
                                            <div className="text-xs">{req.user.username}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 font-medium">
                                            {req.months} сар
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {req.amount.toLocaleString()}₮
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${req.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                                req.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {req.status === "PENDING" && (
                                                    <>
                                                        <form action={approvePayment}>
                                                            <input type="hidden" name="id" value={req.id} />
                                                            <input type="hidden" name="userId" value={req.userId} />
                                                            <input type="hidden" name="months" value={req.months} />
                                                            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-colors">
                                                                Approve
                                                            </button>
                                                        </form>
                                                        <form action={rejectPayment}>
                                                            <input type="hidden" name="id" value={req.id} />
                                                            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors">
                                                                Reject
                                                            </button>
                                                        </form>
                                                    </>
                                                )}
                                                {/* Delete button for all requests - ADMIN ONLY */}
                                                {isAdmin && (
                                                    <form action={deletePayment}>
                                                        <input type="hidden" name="id" value={req.id} />
                                                        <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors">
                                                            Delete
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
