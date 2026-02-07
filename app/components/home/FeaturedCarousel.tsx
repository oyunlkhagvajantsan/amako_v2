"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface FeaturedManga {
    id: number;
    titleMn: true;
    description: string | null;
    coverImage: string | null;
    genres: { nameMn: string }[];
}

interface FeaturedCarouselProps {
    manga: any[]; // Using any to match the prisma select from page.tsx
}

export default function FeaturedCarousel({ manga }: FeaturedCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === manga.length - 1 ? 0 : prev + 1));
    }, [manga.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? manga.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (isHovering) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [nextSlide, isHovering]);

    if (!manga || manga.length === 0) return null;

    const current = manga[currentIndex];

    return (
        <section
            className="relative w-full h-[350px] md:h-[450px] overflow-hidden bg-gray-900 group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Background Layer with Blur */}
            <div className="absolute inset-0 z-0">
                {current.coverImage && (
                    <Image
                        src={current.coverImage}
                        alt="bg"
                        fill
                        className="object-cover opacity-30 blur-2xl scale-110 transition-all duration-1000"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40 z-10" />
            </div>

            {/* Content Layer */}
            <div className="container mx-auto h-full px-4 flex items-center relative z-20">
                <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                    {/* Large Featured Card */}
                    <div className="hidden md:block w-64 aspect-[2/3] relative rounded-2xl shadow-2xl overflow-hidden flex-shrink-0 animate-in fade-in zoom-in duration-700">
                        {current.coverImage && (
                            <Image
                                src={current.coverImage}
                                alt={current.titleMn}
                                fill
                                className="object-cover"
                            />
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl" />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="inline-flex gap-2">
                            {current.genres?.slice(0, 3).map((g: any, i: number) => (
                                <span key={i} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-surface-elevated/90 px-3 py-1 rounded-full shadow-sm">
                                    {g.nameMn}
                                </span>
                            ))}
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-foreground md:text-white drop-shadow-sm line-clamp-2 animate-in fade-in slide-in-from-left duration-700">
                            {current.titleMn}
                        </h2>

                        <p className="hidden md:block text-gray-200 text-lg max-w-xl line-clamp-3 font-medium leading-relaxed drop-shadow-md">
                            {current.description || "Тайлбар байхгүй байна."}
                        </p>

                        <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                            <Link
                                href={`/manga/${current.id}`}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[#d8454f] hover:bg-white hover:text-[#d8454f] text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/20 active:scale-95 group/btn"
                            >
                                <Play size={18} className="fill-current" />
                                Унших
                            </Link>
                            <div className="flex gap-2">
                                {manga.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-[#d8454f] w-8 shadow-sm" : "bg-white/40 hover:bg-white"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/10 text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/10 text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
                <ChevronRight size={24} />
            </button>
        </section>
    );
}
