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
            className="cursor-pointer w-full select-none"
        >
            {children}
        </div>
    );
}
