"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error("ErrorBoundary caught an error", {
            context: { error, errorInfo }
        });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Алдаа гарлаа</h2>
                    <p className="text-gray-500 mb-8 max-w-sm">
                        Хуудсыг ачаалах явцад алдаа гарлаа. Та дахин оролдоно уу эсвэл нүүр хуудас руу буцна уу.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                            <RefreshCcw size={18} />
                            Дахин ачаалах
                        </button>
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all"
                        >
                            <Home size={18} />
                            Нүүр хуудас
                        </Link>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
