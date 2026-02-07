"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-8 h-8" />;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface rounded-full transition-all duration-300 active:scale-95"
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? (
                <Sun size={20} className="animate-in zoom-in spin-in-90 duration-500" />
            ) : (
                <Moon size={20} className="animate-in zoom-in spin-in-45 duration-500" />
            )}
        </button>
    );
}

