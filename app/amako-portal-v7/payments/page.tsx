import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function approvePayment(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const userId = formData.get("userId") as string;
    const monthsStr = formData.get("months") as string;
    const months = monthsStr ? parseInt(monthsStr) : 1;

    // 1. Update Payment Status
    await prisma.paymentRequest.update({
        where: { id },
        data: { status: "APPROVED" },
    });

    // 2. Update User Subscription
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionEnd: true }
    });

    // If user is already subscribed (and not expired), add to existing end date.
    // Otherwise start from now.
    let startDate = new Date();
    if (user?.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()) {
        startDate = new Date(user.subscriptionEnd);
    }

    const newEndDate = new Date(startDate);
    const daysToAdd = 30 * months;
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    await prisma.user.update({
        where: { id: userId },
        data: {
            isSubscribed: true,
            subscriptionEnd: newEndDate,
        },
    });

    revalidatePath("/amako-portal-v7/payments");
}

async function rejectPayment(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await prisma.paymentRequest.update({
        where: { id },
        data: { status: "REJECTED" },
    });

    revalidatePath("/amako-portal-v7/payments");
}

async function deletePayment(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") return;

    const id = formData.get("id") as string;
    await prisma.paymentRequest.delete({
        where: { id },
    });

    revalidatePath("/amako-portal-v7/payments");
}

export default async function PaymentRequestsPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    const requests = await prisma.paymentRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { name: true, email: true }
            }
        }
    });

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Төлбөрийн хүсэлтүүд</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                                        <div className="text-xs">{req.user.name}</div>
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
    );
}
