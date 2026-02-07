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
        <div className="min-h-screen bg-background">
            <Header />

            {status === "loading" || !session ? (
                <main className="container mx-auto px-4 py-8 max-w-lg text-center">
                    <p className="text-muted">Уншиж байна...</p>
                </main>
            ) : (
                <main className="container mx-auto px-4 py-8 max-w-lg">
                    <h1 className="text-2xl font-bold mb-6 text-foreground text-center">Төлбөр төлөх заавар</h1>

                    <div className="bg-surface-elevated p-6 rounded-xl border border-border shadow-sm mb-6">
                        <div className="space-y-4 text-sm text-foreground">
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="font-medium text-muted">Банк:</span>
                                <span className="font-bold text-sm">{PAYMENT_INFO.bank}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-border pb-2">
                                <span className="font-medium text-muted">Дансны дугаар:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm select-all">{PAYMENT_INFO.accountNumber}</span>
                                    <button
                                        onClick={() => copyToClipboard(PAYMENT_INFO.accountNumber, "account")}
                                        className="px-2 py-1 bg-surface hover:bg-surface-elevated rounded text-xs transition-colors border border-border"
                                        title="Copy"
                                    >
                                        {copiedField === "account" ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-muted" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b border-border pb-2">
                                <span className="font-medium text-muted">IBAN дугаар:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm select-all">{PAYMENT_INFO.iban}</span>
                                    <button
                                        onClick={() => copyToClipboard(PAYMENT_INFO.iban, "iban")}
                                        className="px-2 py-1 bg-surface hover:bg-surface-elevated rounded text-xs transition-colors border border-border"
                                        title="Copy"
                                    >
                                        {copiedField === "iban" ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-muted" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between border-b border-border pb-2">
                                <span className="font-medium text-muted">Дансны нэр:</span>
                                <span className="font-bold text-sm">{PAYMENT_INFO.accountName}</span>
                            </div>

                            <div className="py-4 border-b border-border">
                                <label className="block text-sm font-medium text-muted mb-2">Хугацаа сонгох:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setMonths(m)}
                                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${months === m
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-surface border-border text-muted hover:bg-surface-elevated"
                                                }`}
                                        >
                                            {m} Сар
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="font-medium text-muted">Төлөх дүн:</span>
                                <span className="font-bold text-2xl text-primary">{currentPrice.toLocaleString()}₮</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="font-medium text-muted">Гүйлгээний утга:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground">{session?.user?.email}</span>
                                    <button
                                        onClick={() => copyToClipboard(session?.user?.email || "", "email")}
                                        className="px-2 py-1 bg-surface hover:bg-surface-elevated rounded text-xs transition-colors border border-border"
                                        title="Copy"
                                    >
                                        {copiedField === "email" ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-muted" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-surface-elevated p-8 rounded-xl border border-border shadow-sm space-y-6 text-foreground">
                        <h2 className="font-bold text-lg">Баталгаажуулах</h2>

                        {error && (
                            <div className="bg-error/10 text-error p-3 rounded-lg text-sm border border-error/20">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="p-4 bg-warning/10 text-warning-dark rounded-lg text-sm border border-warning/20">
                                Шилжүүлсэн бол доорх товчийг дарна уу. Админ шалгаад таны эрхийг сунгах болно.
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-70 shadow-lg shadow-primary/20"
                        >
                            {isLoading ? "Илгээж байна..." : "Илгээх"}
                        </button>
                    </form>
                </main>
            )}
        </div>
    );
}
