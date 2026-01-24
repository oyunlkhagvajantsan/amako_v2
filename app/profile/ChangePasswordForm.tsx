"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChangePasswordForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [newPassword, setNewPassword] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const currentPassword = formData.get("currentPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Шинэ нууц үгнүүд таарахгүй байна" });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setMessage({ type: "success", text: "Нууц үг амжилттай солигдлоо" });
            (e.target as HTMLFormElement).reset();
            setNewPassword("");
            router.refresh();
        } catch (error: any) {
            setMessage({ type: "error", text: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Lock size={18} />
                    Нууц үг солих
                </h3>
            </div>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {message.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Одоогийн нууц үг
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d8454f]/20 focus:border-[#d8454f] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Шинэ нууц үг
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d8454f]/20 focus:border-[#d8454f] transition-colors"
                        />
                        <div className="mt-2 space-y-1">
                            <div className={`text-xs flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-1 h-1 rounded-full ${newPassword.length >= 8 ? 'bg-green-600' : 'bg-gray-300'}`} />
                                Дор хаяж 8 тэмдэгт
                            </div>
                            <div className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                Том үсэг (A-Z)
                            </div>
                            <div className={`text-xs flex items-center gap-2 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                Тоо (0-9)
                            </div>
                            <div className={`text-xs flex items-center gap-2 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                                <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-600' : 'bg-gray-300'}`} />
                                Тусгай тэмдэгт (!@#$%...)
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Шинэ нууц үг давтах
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            minLength={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d8454f]/20 focus:border-[#d8454f] transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-[#d8454f] text-white font-medium rounded-lg hover:bg-[#c13a44] transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Уншиж байна..." : "Хадгалах"}
                    </button>
                </form>
            </div>
        </div>
    );
}
