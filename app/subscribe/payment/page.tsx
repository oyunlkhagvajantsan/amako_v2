"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import { PRICING, getPrice } from "@/lib/pricing";
import { PAYMENT_INFO } from "@/lib/payment";
import { Check, Copy } from "lucide-react";

export default function PaymentPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [months, setMonths] = useState(1);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Check authentication
    useEffect(() => {
        if (status === "loading") return; // Wait for session to load
        if (!session) {
            // Redirect to login if not authenticated
            router.push("/login?callbackUrl=/subscribe/payment");
        }
    }, [session, status, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("months", months.toString());

        try {
            const res = await fetch("/api/subscription/request", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit payment");
            }

            // Redirect to success/pending page (or back to home with message)
            alert("Төлбөрийн баримт илгээгдлээ! Админ шалгахыг хүлээнэ үү.");
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Calculate current price based on selected months
    const currentPrice = getPrice(months);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {status === "loading" || !session ? (
                <main className="container mx-auto px-4 py-8 max-w-lg text-center">
                    <p className="text-gray-500">Loading...</p>
                </main>
            ) : (
                <main className="container mx-auto px-4 py-8 max-w-lg">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">Төлбөр төлөх заавар</h1>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                        <div className="space-y-4 text-sm text-gray-700">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-gray-500">Банк:</span>
                                <span className="font-bold text-sm">{PAYMENT_INFO.bank}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">Дансны дугаар:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm select-all">{PAYMENT_INFO.accountNumber}</span>
                                    <button
                                        onClick={() => copyToClipboard(PAYMENT_INFO.accountNumber, "account")}
                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                                        title="Copy"
                                    >
                                        {copiedField === "account" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="font-medium text-gray-500">IBAN дугаар:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm select-all">{PAYMENT_INFO.iban}</span>
                                    <button
                                        onClick={() => copyToClipboard(PAYMENT_INFO.iban, "iban")}
                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                                        title="Copy"
                                    >
                                        {copiedField === "iban" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-gray-500">Дансны нэр:</span>
                                <span className="font-bold text-sm">{PAYMENT_INFO.accountName}</span>
                            </div>

                            <div className="py-4 border-b border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Хугацаа сонгох:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMonths(1)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${months === 1
                                            ? "bg-red-50 border-[#d8454f] text-[#d8454f]"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        1 Сар
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMonths(2)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${months === 2
                                            ? "bg-red-50 border-[#d8454f] text-[#d8454f]"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        2 Сар
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMonths(3)}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${months === 3
                                            ? "bg-red-50 border-[#d8454f] text-[#d8454f]"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        3 Сар
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="font-medium text-gray-500">Төлөх дүн:</span>
                                <span className="font-bold text-2xl text-[#d8454f]">{currentPrice.toLocaleString()}₮</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Гүйлгээний утга:</span>
                                <span className="font-bold text-black-500">{session?.user?.email}</span>
                                <button
                                    onClick={() => copyToClipboard(session?.user?.email || "", "email")}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                                    title="Copy"
                                >
                                    {copiedField === "email" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <h2 className="font-bold text-lg">Баталгаажуулах</h2>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                                Шилжүүлсэн бол доорх товчийг дарна уу. Админ шалгаад таны эрхийг сунгах болно.
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-[#d8454f] hover:bg-[#c13a44] text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                        >
                            {isLoading ? "Илгээж байна..." : "Илгээх"}
                        </button>
                    </form>
                </main>
            )}
        </div>
    );
}
