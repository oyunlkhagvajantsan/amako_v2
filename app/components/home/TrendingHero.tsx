"use client";

import Image from "next/image";
import Link from "next/link";
import { TrendingUp, Star, BookOpen, ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface TrendingHeroProps {
    manga: any[];
}

export default function TrendingHero({ manga }: TrendingHeroProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll functionality
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const container = scrollRef.current;
                // Get the first card width dynamically
                const card = container.firstElementChild as HTMLElement;
                if (!card) return;

                const cardWidth = card.offsetWidth;
                const gap = 16; // gap-4 is 1rem = 16px
                const itemWidth = cardWidth + gap;

                const { scrollLeft, scrollWidth, clientWidth } = container;
                const maxScroll = scrollWidth - clientWidth;

                // Calculate next position
                const nextPosition = scrollLeft + itemWidth;

                // If next scroll would go past the end, reset to start
                if (nextPosition >= maxScroll) {
                    container.scrollTo({ left: 0, behavior: "smooth" });
                } else {
                    // Otherwise scroll to the next item (one card at a time)
                    container.scrollTo({ left: nextPosition, behavior: "smooth" });
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!manga || manga.length === 0) return null;

    return (
        <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory no-scrollbar"
        >
            {manga.slice(0, 5).map((m) => {
                // Translation maps
                const statusMap: Record<string, string> = { ONGOING: "Гарч байгаа", COMPLETED: "Дууссан", HIATUS: "Зогссон" };
                const typeMap: Record<string, string> = { MANGA: "Манга", MANHWA: "Манхва", MANHUA: "Манхуа", ONESHOT: "Oneshot" };

                return (
                    <Link
                        key={m.id}
                        href={`/manga/${m.id}`}
                        className="flex-shrink-0 w-[calc(100vw-2rem)] md:w-[440px] bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all snap-start overflow-hidden group flex"
                    >
                        {/* Vertical Image (Uncropped) */}
                        <div className="relative w-[140px] md:w-[100px] aspect-[2/3] flex-shrink-0 bg-gray-100">
                            {m.coverImage && (
                                <Image
                                    src={m.coverImage}
                                    alt={m.titleMn}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>

                        {/* Side Content */}
                        <div className="flex-1 p-4 md:p-3 flex flex-col justify-between min-w-0">
                            <div>
                                <h3 className="text-lg md:text-base font-bold text-gray-900 line-clamp-3 leading-snug group-hover:text-[#d8454f] transition-colors mb-4 md:mb-2">
                                    {m.titleMn}
                                </h3>

                                <div className="flex flex-wrap gap-1">
                                    {/* Status Badge */}
                                    <span className={`text-[10px] md:text-[9px] font-bold px-2 md:px-1.5 py-0.5 rounded border ${m.status === 'ONGOING'
                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                        : 'bg-green-50 text-green-600 border-green-100'
                                        }`}>
                                        {statusMap[m.status] || m.status}
                                    </span>

                                    {/* Type Badge */}
                                    <span className="text-[10px] md:text-[9px] font-bold text-gray-500 bg-gray-50 px-2 md:px-1.5 py-0.5 rounded border border-gray-100">
                                        {typeMap[m.type] || m.type}
                                    </span>

                                    {/* 18+ Badge */}
                                    {m.isAdult && (
                                        <span className="text-[10px] md:text-[9px] font-bold text-white bg-[#d8454f] px-2 md:px-1.5 py-0.5 rounded border border-[#d8454f]">
                                            18+
                                        </span>
                                    )}

                                    {/* Oneshot Badge */}
                                    {m.isOneshot && (
                                        <span className="text-[10px] md:text-[9px] font-bold text-white bg-[#d8454f] px-2 md:px-1.5 py-0.5 rounded border border-[#d8454f]">
                                            Oneshot
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                                <div className="flex items-center gap-1 text-gray-400 text-xs md:text-[10px] font-medium">
                                    <BookOpen size={12} className="md:hidden" />
                                    <BookOpen size={10} className="hidden md:block" />
                                    <span>{m._count?.chapters || 0} бүлэг</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs md:text-[10px] font-bold text-[#d8454f]">
                                    <span>Унших</span>
                                    <ArrowRight size={16} className="md:hidden" />
                                    <ArrowRight size={14} className="hidden md:block" />
                                </div>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    );
}
