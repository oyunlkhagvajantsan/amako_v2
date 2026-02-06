"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-3xl font-bold text-[#d8454f]">Amako</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">Бүртгүүлэх</h2>
                    {/* <p className="mt-2 text-sm text-gray-600">
                        Манга уншиж эхлэхдээ бэлэн үү?
                    </p> */}
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
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
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#d8454f] focus:border-[#d8454f] focus:z-10 sm:text-sm"
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
                            <div className="mt-2 space-y-1">
                                <div className={`text-xs flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                    <div className={`w-1 h-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-600' : 'bg-gray-300'}`} />
                                    Дор хаяж 8 тэмдэгт
                                </div>
                                <div className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                    <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                    Том үсэг (A-Z)
                                </div>
                                <div className={`text-xs flex items-center gap-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                    <div className={`w-1 h-1 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                    Жижиг үсэг (a-z)
                                </div>
                                <div className={`text-xs flex items-center gap-2 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                                    <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                    Тоо (0-9)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#d8454f] hover:bg-[#c13a44] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d8454f] disabled:opacity-70 transition-colors"
                        >
                            {isLoading ? "Уншиж байна..." : "Бүртгүүлэх"}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Бүртгэлтэй юу? </span>
                    <Link href="/login" className="font-medium text-[#d8454f] hover:text-[#c13a44]">
                        Нэвтрэх
                    </Link>
                </div>
            </div>
        </div>
    );
}
