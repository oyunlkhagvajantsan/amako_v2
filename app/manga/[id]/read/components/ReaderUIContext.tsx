"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ReaderUIContext = createContext<{
    isUIVisible: boolean;
    toggleUI: () => void;
}>({ isUIVisible: true, toggleUI: () => { } });

export const useReaderUI = () => useContext(ReaderUIContext);

export function ReaderUIProvider({ children }: { children: React.ReactNode }) {
    const [isUIVisible, setIsUIVisible] = useState(true);
    const toggleUI = () => setIsUIVisible((prev) => !prev);

    useEffect(() => {
        if (!isUIVisible) {
            document.body.classList.add("hide-reader-ui");
        } else {
            document.body.classList.remove("hide-reader-ui");
        }
        return () => {
            document.body.classList.remove("hide-reader-ui");
        };
    }, [isUIVisible]);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Scroll down: hide UI
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsUIVisible(false);
            } 
            // Scroll up: show UI (with small threshold to avoid jitter)
            else if (currentScrollY < lastScrollY && (lastScrollY - currentScrollY > 5)) {
                setIsUIVisible(true);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <ReaderUIContext.Provider value={{ isUIVisible, toggleUI }}>
            {children}
        </ReaderUIContext.Provider>
    );
}

export function ReaderTapZone({ children }: { children: React.ReactNode }) {
    const { toggleUI } = useReaderUI();

    return (
        <div
            onClick={toggleUI}
            className="cursor-pointer w-full select-none outline-none [-webkit-touch-callout:none]"
            style={{ WebkitTapHighlightColor: "transparent" }}
        >
            {children}
        </div>
    );
}
