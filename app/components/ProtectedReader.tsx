"use client";

import React from "react";

interface ProtectedReaderProps {
    children: React.ReactNode;
}

export default function ProtectedReader({ children }: ProtectedReaderProps) {
    return (
        <main
            className="max-w-3xl mx-auto bg-black min-h-screen relative select-none"
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="relative">
                {/* Protection Shield Overlay */}
                <div
                    className="absolute inset-0 z-10"
                    aria-hidden="true"
                />
                {children}
            </div>
        </main>
    );
}
