"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const registered = searchParams.get("registered");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                identifier: formData.email,
                password: formData.password,
            });

            if (res?.error) {
                setError("Имэйл эсвэл нууц үг буруу байна.");
            } else {
                // Set session-only active cookie for SessionGuard
                document.cookie = "amako_session_active=true; path=/;";

                const callbackUrl = searchParams.get("callbackUrl");
                router.push(callbackUrl || "/");
                router.refresh();
            }
        } catch (err) {
            setError("Failed to login. Please try again.");
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
                    <h2 className="text-2xl font-bold text-foreground">Нэвтрэх</h2>
                    <p className="mt-2 text-sm text-muted">
                        Тавтай морил!
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {registered && (
                        <div className="bg-success/10 text-success p-3 rounded-xl text-sm text-center border border-success/20">
                            Бүртгэл амжилттай! Та одоо нэвтэрнэ үү.
                        </div>
                    )}

                    {error && (
                        <div className="bg-error/10 text-error p-3 rounded-xl text-sm text-center border border-error/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Имэйл эсвэл хэрэглэгчийн нэр</label>
                            <input
                                id="email-address"
                                name="identifier"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-border bg-background placeholder-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                                placeholder="Имэйл эсвэл нэвтрэх нэр"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Нууц үг</label>
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
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href="/forgot-password" university-link="true" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                            Нууц үгээ мартсан?
                        </Link>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
                        >
                            {isLoading ? "Уншиж байна..." : "Нэвтрэх"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-muted">Бүртгэлгүй юу? </span>
                    <Link href="/signup" className="font-bold text-primary hover:text-primary-dark transition-colors">
                        Бүртгүүлэх
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
