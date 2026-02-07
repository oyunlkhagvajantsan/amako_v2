"use client";

import { useState, useEffect, useCallback } from "react";

const SEARCH_HISTORY_KEY = "amako_search_history";
const MAX_HISTORY_LENGTH = 10;

export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (storedHistory) {
            try {
                const parsed = JSON.parse(storedHistory);
                if (Array.isArray(parsed)) {
                    setHistory(parsed);
                }
            } catch (e) {
                console.error("Failed to parse search history", e);
            }
        }
    }, []);

    // Save history to localStorage whenever it changes
    const saveHistory = useCallback((newHistory: string[]) => {
        setHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    }, []);

    const addSearchTerm = useCallback((term: string) => {
        const trimmedTerm = term.trim();
        if (!trimmedTerm) return;

        setHistory((prev) => {
            // Remove the term if it already exists to move it to the front
            const filtered = prev.filter((item) => item.toLowerCase() !== trimmedTerm.toLowerCase());
            const newHistory = [trimmedTerm, ...filtered].slice(0, MAX_HISTORY_LENGTH);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const removeSearchTerm = useCallback((term: string) => {
        setHistory((prev) => {
            const newHistory = prev.filter((item) => item !== term);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    }, []);

    return {
        history,
        addSearchTerm,
        removeSearchTerm,
        clearHistory,
    };
}
