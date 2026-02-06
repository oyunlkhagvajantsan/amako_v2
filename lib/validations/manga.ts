import { z } from "zod";

const MangaStatus = z.enum(["ONGOING", "COMPLETED", "HIATUS"]);
const MangaType = z.enum(["MANGA", "MANHWA", "MANHUA", "ONESHOT"]);

export const mangaSchema = z.object({
    title: z.string().min(1, "Гарчиг оруулна уу").max(255),
    titleMn: z.string().min(1, "Монгол гарчиг оруулна уу").max(255),
    description: z.string().optional(),
    coverImage: z.string().url("Зурагны URL буруу байна").optional().or(z.literal("")),
    status: MangaStatus,
    type: MangaType,
    author: z.string().optional(),
    artist: z.string().optional(),
    publishYear: z.number().int().min(1900).max(2100).optional().or(z.null()),
    isAdult: z.boolean().default(false),
    isOneshot: z.boolean().default(false),
    genreIds: z.array(z.number()).optional(),
});

export const chapterSchema = z.object({
    chapterNumber: z.number().min(0),
    title: z.string().optional().or(z.null()),
    mangaId: z.number().int(),
    isFree: z.boolean().default(true),
    isPublished: z.boolean().default(false),
});
