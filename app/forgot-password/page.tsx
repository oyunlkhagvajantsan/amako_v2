"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Key, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleSendCode(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Something went wrong");

            setMessage({ type: "success", text: "Нууц үг сэргээх код таны имэйл рүү илгээгдлээ." });
            setStep(2);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Something went wrong");

            setMessage({ type: "success", text: "Нууц үг амжилттай солигдлоо. Түр хүлээнэ үү..." });
            setTimeout(() => router.push("/login"), 2000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full bg-surface p-8 rounded-3xl shadow-sm border border-border">
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center text-sm text-muted hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft size={16} className="mr-1.5" /> Буцах
                    </Link>
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                            {step === 1 ? <Mail size={32} /> : <Key size={32} />}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                        {step === 1 ? "Нууц үгээ мартсан уу?" : "Нууц үгээ солих"}
                    </h2>
                    <p className="mt-2 text-sm text-muted leading-relaxed">
                        {step === 1
                            ? "Баталгаажуулах код авах имэйл хаягаа оруулна уу."
                            : "Имэйл рүү тань илгээсэн код болон шинэ нууц үгээ оруулна уу."}
                    </p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-sm text-center border animate-fade-in ${message.type === "success" ? "bg-success/10 text-success border-success/20" : "bg-error/10 text-error border-error/20"}`}>
                        {message.text}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-foreground/80 mb-2 px-1">
                                Имэйл хаяг
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-border rounded-xl bg-background placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/10 text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Код илгээх"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label htmlFor="code" className="block text-sm font-bold text-foreground/80 mb-2 px-1">
                                Баталгаажуулах код
                            </label>
                            <input
                                type="text"
                                id="code"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono tracking-widest text-center text-lg"
                                placeholder="123456"
                                maxLength={6}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-bold text-foreground/80 mb-2 px-1">
                                Шинэ нууц үг
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-border rounded-xl bg-background placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                placeholder="••••••••"
                            />
                            <div className="mt-4 space-y-2">
                                <div className={`text-[11px] flex items-center gap-2 font-medium ${newPassword.length >= 8 ? 'text-green-500' : 'text-muted'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-border'}`} />
                                    Дор хаяж 6 тэмдэгт
                                </div>
                                <div className={`text-[11px] flex items-center gap-2 font-medium ${/[A-Z]/.test(newPassword) ? 'text-green-500' : 'text-muted'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-border'}`} />
                                    Том үсэг (A-Z)
                                </div>
                                <div className={`text-[11px] flex items-center gap-2 font-medium ${/[0-9]/.test(newPassword) ? 'text-green-500' : 'text-muted'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-border'}`} />
                                    Тоо (0-9)
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/10 text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Нууц үг солих"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-center text-sm font-medium text-muted hover:text-foreground transition-colors"
                        >
                            Имэйл хаяг солих
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
