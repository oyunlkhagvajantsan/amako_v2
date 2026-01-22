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
                email: formData.email,
                password: formData.password,
            });

            if (res?.error) {
                setError("Имэйл эсвэл нууц үг буруу байна.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("Failed to login. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <Link href="/" className="inline-block mb-6 relative w-40 h-12">
                        <Image
                            src="/uploads/images/logo_text.webp"
                            alt="Amako Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">Нэвтрэх</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Тавтай морил!
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {registered && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">
                            Бүртгэл амжилттай! Та одоо нэвтэрнэ үү.
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Имэйл хаяг</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#d8454f] focus:border-[#d8454f] focus:z-10 sm:text-sm"
                                placeholder="Имэйл хаяг"
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
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#d8454f] focus:border-[#d8454f] focus:z-10 sm:text-sm"
                                placeholder="Нууц үг"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href="/forgot-password" className="text-sm font-medium text-[#d8454f] hover:text-[#c13a44]">
                            Нууц үгээ мартсан?
                        </Link>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#d8454f] hover:bg-[#c13a44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d8454f] disabled:opacity-70 transition-colors"
                        >
                            {isLoading ? "Уншиж байна..." : "Нэвтрэх"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Бүртгэлгүй юу? </span>
                    <Link href="/signup" className="font-medium text-[#d8454f] hover:text-[#c13a44]">
                        Бүртгүүлэх
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}
