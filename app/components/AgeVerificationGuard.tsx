"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldAlert } from "lucide-react";

interface AgeVerificationGuardProps {
    children: React.ReactNode;
    active?: boolean;
}

export default function AgeVerificationGuard({ children, active = true }: AgeVerificationGuardProps) {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const [isVerified, setIsVerified] = useState<boolean | null>(null);

    useEffect(() => {
        if (!active) return;

        // Wait for session to finish loading
        if (status === "loading") return;

        const checkVerification = () => {
            const dbVerified = session?.user?.ageVerified;
            const sessionVerified = typeof window !== "undefined" ? sessionStorage.getItem("amako_age_verified") === "true" : false;

            console.log("[AgeVerification] Checking status:", {
                status,
                dbVerified,
                sessionVerified,
                user: session?.user?.email
            });

            return !!dbVerified || sessionVerified;
        };

        setIsVerified(checkVerification());
    }, [active, session, status]);

    // If not active, just render the content
    if (!active) {
        return <>{children}</>;
    }

    const handleVerify = async () => {
        try {
            if (session?.user) {
                // Logged in: Persist to DB
                console.log("Member verifying age...");
                const res = await fetch("/api/user/verify-age", { method: "POST" });

                if (res.ok) {
                    console.log("DB update successful, refreshing session...");
                    // Update the local session and wait for it
                    const newSession = await update({
                        ...session,
                        user: { ...session.user, ageVerified: true }
                    });
                    console.log("Session updated:", newSession);
                } else {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to update database");
                }
            } else {
                // Guest: Session only
                console.log("Guest verifying age...");
                sessionStorage.setItem("amako_age_verified", "true");
            }

            // Force local state update regardless of session speed
            setIsVerified(true);

        } catch (error) {
            console.error("Age verification failed:", error);
            // Fallback to session storage so user isn't blocked by minor API issues
            sessionStorage.setItem("amako_age_verified", "true");
            setIsVerified(true);
        }
    };

    const handleDecline = () => {
        router.push("/");
    };

    // If not active, just render the content
    if (!active) {
        return <>{children}</>;
    }

    // While checking session OR status is loading, wait
    if (isVerified === null || status === "loading") {
        return null;
    }

    if (isVerified) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
            <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6 text-[#d8454f]">
                    <ShieldAlert size={40} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Анхааруулга (18+)</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Энэ бүлэгт насанд хүрэгчдэд зориулсан зураг, агуулга багтсан. Та 18-аас дээш настай юу?
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleVerify}
                        className="w-full py-3.5 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-900/20 active:scale-95"
                    >
                        Тийм
                    </button>
                    <button
                        onClick={handleDecline}
                        className="w-full py-3.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors"
                    >
                        Үгүй
                    </button>
                </div>
            </div>
        </div>
    );
}
