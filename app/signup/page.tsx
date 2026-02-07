"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/login?registered=true");
            } else {
                const data = await res.json();
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to register. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-3xl shadow-sm border border-border">
                <div className="text-center">
                    <Link href="/" className="inline-block mb-6 relative w-40 h-10">
                        <Image
                            src="/uploads/images/logo_text.webp"
                            alt="Amako Logo"
                            fill
                            className="object-contain dark:invert transition-all"
                            priority
                        />
                    </Link>
                    <h2 className="text-2xl font-bold text-foreground">Бүртгүүлэх</h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-error/10 text-error p-3 rounded-xl text-sm text-center border border-error/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">Хэрэглэгчийн нэр</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-border bg-background placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                placeholder="Хэрэглэгчийн нэр"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">Имэйл хаяг</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-border bg-background placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                placeholder="Имэйл хаяг"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" university-link="true" className="sr-only">Нууц үг</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-border bg-background placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                placeholder="Нууц үг"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <div className="mt-4 space-y-2">
                                <div className={`text-[11px] flex items-center gap-2 font-medium ${formData.password.length >= 6 ? 'text-green-500' : 'text-muted'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-border'}`} />
                                    Дор хаяж 6 тэмдэгт
                                </div>
                                <div className={`text-[11px] flex items-center gap-2 font-medium ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-muted'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-border'}`} />
                                    Том үсэг (A-Z)
                                </div>
                                <div className={`text-[11px] flex items-center gap-2 font-medium ${/[a-z]/.test(formData.password) ? 'text-green-500' : 'text-muted'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-border'}`} />
                                    Жижиг үсэг (a-z)
                                </div>
                                <div className={`text-[11px] flex items-center gap-2 font-medium ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-muted'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-border'}`} />
                                    Тоо (0-9)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
                        >
                            {isLoading ? "Уншиж байна..." : "Бүртгүүлэх"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted">Бүртгэлтэй юу? </span>
                    <Link href="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
                        Нэвтрэх
                    </Link>
                </div>
            </div>
        </div>
    );
}
