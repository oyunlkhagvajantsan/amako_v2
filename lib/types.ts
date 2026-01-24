import { Prisma } from "@prisma/client";

// Manga related types
export type MangaWithGenres = Prisma.MangaGetPayload<{
    include: { genres: true }
}>;

export type MangaWithChaptersAndGenres = Prisma.MangaGetPayload<{
    include: {
        chapters: {
            where: { isPublished: true },
            orderBy: { chapterNumber: "desc" },
        },
        genres: true,
    },
}>;

// Chapter related types
export type ChapterWithManga = Prisma.ChapterGetPayload<{
    include: { manga: true }
}>;

// Comment related types
export interface CommentUser {
    id: string;
    name: string | null;
    image: string | null;
    role: "USER" | "ADMIN" | "MODERATOR";
}

export interface CommentData {
    id: string;
    content: string;
    createdAt: string;
    userId: string;
    mangaId: number;
    chapterId?: number | null;
    isHidden: boolean;
    user: CommentUser;
    likes: { userId: string }[];
    _count: {
        likes: number;
        replies?: number;
    };
    replies?: CommentData[];
    isOptimistic?: boolean;
}

export interface CommentItemProps {
    comment: CommentData;
    mangaId: number;
    onRefresh: () => void;
    isReply?: boolean;
    variant?: 'light' | 'dark';
}

// User related types
export type UserFull = Prisma.UserGetPayload<{
    include: {
        paymentRequests: true,
        readHistory: {
            include: {
                chapter: {
                    include: {
                        manga: true
                    }
                }
            }
        },
        comments: true,
    }
}>;
