"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error centrally
        logger.error("Global error caught", {
            context: { error, digest: error.digest }
        });
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={40} />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">Системийн алдаа гарлаа</h1>
                <p className="text-gray-500 mb-8">
                    Уучлаарай, системийн дотоод алдаа гарлаа. Бид үүнийг аль хэдийн тэмдэглэн авсан бөгөөд засварлахаар ажиллаж байна.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full py-3 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/10 flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} />
                        Дахин оролдох
                    </button>
                    <Link
                        href="/"
                        className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={20} />
                        Нүүр хуудас руу буцах
                    </Link>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        Алдааны код: <span className="font-mono">{error.digest || 'Internal Server Error'}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
