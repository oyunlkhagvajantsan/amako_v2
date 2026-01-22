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

            setMessage({ type: "success", text: "Code sent to your email!" });
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

            setMessage({ type: "success", text: "Password reset successfully! Redirecting..." });
            setTimeout(() => router.push("/login"), 2000);
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                        <ArrowLeft size={16} className="mr-1" /> Буцах
                    </Link>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-50 rounded-full text-[#d8454f]">
                            {step === 1 ? <Mail size={32} /> : <Key size={32} />}
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {step === 1 ? "Нууц үгээ мартсан уу?" : "Нууц үгээ солих"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1
                            ? "Баталгаажуулах код авах имэйл хаягаа оруулна уу."
                            : "Имэйл рүү тань илгээсэн код болон шинэ нууц үгээ оруулна уу."}
                    </p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {message.text}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Имэйл хаяг
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d8454f]/20 focus:border-[#d8454f] transition-colors"
                                placeholder="name@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#d8454f] hover:bg-[#c13a44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d8454f] disabled:opacity-70 transition-colors"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Код илгээх"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                                Баталгаажуулах код
                            </label>
                            <input
                                type="text"
                                id="code"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d8454f]/20 focus:border-[#d8454f] transition-colors font-mono tracking-widest text-center text-lg"
                                placeholder="123456"
                                maxLength={6}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Шинэ нууц үг
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d8454f]/20 focus:border-[#d8454f] transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#d8454f] hover:bg-[#c13a44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d8454f] disabled:opacity-70 transition-colors"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Нууц үг солих"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-900"
                        >
                            Имэйл хаяг солих
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
