"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SequentialImageLoaderProps {
    images: string[];
    chapterId?: number;
    trackHistory?: boolean;
    initialPage?: number;
}

export default function SequentialImageLoader({ 
    images, 
    chapterId, 
    trackHistory = false, 
    initialPage = 0 
}: SequentialImageLoaderProps) {
    const [loadedIndex, setLoadedIndex] = useState(-1);
    const [visiblePage, setVisiblePage] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrolledToInitial = useRef(false);
    
    // Setup IntersectionObserver to track visible image
    useEffect(() => {
        if (!containerRef.current || !trackHistory) return;
        
        const observerOptions = {
            root: null,
            rootMargin: "0px",
            threshold: 0.5, // 50% of the image must be visible
        };

        const observerCb = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                    setVisiblePage(index);
                }
            });
        };

        const observer = new IntersectionObserver(observerCb, observerOptions);
        
        const imgElements = containerRef.current.querySelectorAll('.manga-page-img');
        imgElements.forEach(img => observer.observe(img));

        return () => observer.disconnect();
    }, [trackHistory, images.length, loadedIndex]); // Re-run when new images are loaded into dome

    // Sync progress to backend debounced
    useEffect(() => {
        if (!trackHistory || !chapterId || visiblePage === 0) return;

        const timeout = setTimeout(() => {
            fetch("/api/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chapterId, lastPage: visiblePage }),
            }).catch(e => console.error("History sync error:", e));
        }, 2000);

        return () => clearTimeout(timeout);
    }, [visiblePage, chapterId, trackHistory]);

    // Handle scroll to initialPage
    useEffect(() => {
        if (scrolledToInitial.current || initialPage <= 0 || loadedIndex < initialPage) return;

        const el = document.getElementById(`page-${initialPage}`);
        if (el) {
            el.scrollIntoView({ behavior: 'auto', block: 'start' });
            scrolledToInitial.current = true;
        }
    }, [loadedIndex, initialPage]);

    // Eagerly pre-load the first image (or up to initialPage + 1), and tell the Next/React runtime
    // to render the rest progressively as the previous ones finish loading.
    return (
        <div ref={containerRef} className="flex flex-col items-center w-full">
            {images.map((imgUrl, index) => {
                // Determine if we should load this image
                const isInitialLoad = !scrolledToInitial.current && initialPage > 0;
                // If it's part of the initial skip, load it immediately, otherwise load sequentially
                const shouldLoad = isInitialLoad ? index <= initialPage + 1 : index <= loadedIndex + 1;

                return (
                    <div key={index} id={`page-${index}`} className="w-full relative min-h-[50vh] bg-surface/30 animate-pulse-soft">
                        {shouldLoad && (
                            <img
                                src={imgUrl}
                                alt={`Page ${index + 1}`}
                                data-index={index}
                                className="manga-page-img w-full h-auto block select-none pointer-events-none"
                                draggable="false"
                                onLoad={() => {
                                    if (index > loadedIndex) {
                                        setLoadedIndex(index);
                                    }
                                }}
                                // Hide the browser's broken image icon while it loads
                                style={{ color: "transparent" }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
