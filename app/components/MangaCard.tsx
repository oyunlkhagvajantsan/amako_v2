import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";

interface MangaCardProps {
    manga: {
        id: string | number;
        titleMn: string;
        coverImage: string;
        viewCount?: number;
        _count?: {
            chapters: number;
        };
    };
    badge?: React.ReactNode;
    subtitle?: React.ReactNode;
    customLink?: string;
    className?: string;
}

export default function MangaCard({ manga, badge, subtitle, customLink, className = "" }: MangaCardProps) {
    return (
        <Link
            href={customLink || `/manga/${manga.id}`}
            className={`flex-shrink-0 group block ${className || "w-full"}`}
        >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 mb-2">
                <Image
                    src={manga.coverImage}
                    alt={manga.titleMn}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* View Count Badge - Always show if viewCount is present, unless overridden? 
                    Actually, Home page shows viewCount on Popular, but Latest shows Chapter Number.
                    Let's use the 'badge' prop for the absolute positioned item.
                */}
                {badge ? (
                    badge
                ) : (
                    manga.viewCount !== undefined && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            <Eye size={12} /> {manga.viewCount.toLocaleString()}
                        </div>
                    )
                )}
            </div>

            <h3 className="font-medium text-sm text-gray-900 mb-1 break-words whitespace-normal text-center leading-tight">
                {manga.titleMn}
            </h3>

            {subtitle && (
                <div className="text-xs text-gray-500 text-center">
                    {subtitle}
                </div>
            )}
        </Link>
    );
}
