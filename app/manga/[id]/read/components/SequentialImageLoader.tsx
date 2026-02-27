"use client";

import { useState, useEffect } from "react";

export default function SequentialImageLoader({ images }: { images: string[] }) {
    const [loadedIndex, setLoadedIndex] = useState(-1);

    // Eagerly pre-load the first image, and tell the Next/React runtime
    // to render the rest progressively as the previous ones finish loading.
    return (
        <div className="flex flex-col items-center w-full">
            {images.map((imgUrl, index) => {
                // If this image comes after the currently completely loaded image + 1
                // We don't mount the actual image tag yet to prevent parallel downloading
                const shouldLoad = index <= loadedIndex + 1;

                return (
                    <div key={index} className="w-full relative min-h-[50vh] bg-surface/30 animate-pulse-soft">
                        {shouldLoad && (
                            <img
                                src={imgUrl}
                                alt={`Page ${index + 1}`}
                                className="w-full h-auto block select-none pointer-events-none"
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
