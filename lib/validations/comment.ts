import { z } from "zod";

export const createCommentSchema = z.object({
    content: z.string()
        .min(1, "Сэтгэгдэл хоосон байж болохгүй")
        .max(1000, "Сэтгэгдэл хэтэрхий урт байна (дээд тал нь 1000 тэмдэгт)"),
    chapterId: z.union([z.number(), z.string(), z.null()]).optional()
        .transform((val) => {
            if (typeof val === 'string') return parseInt(val, 10);
            return val;
        }),
});

export const replyCommentSchema = z.object({
    content: z.string()
        .min(1, "Хариу хоосон байж болохгүй")
        .max(1000, "Хариу хэтэрхий урт байна (дээд тал нь 1000 тэмдэгт)"),
    mangaId: z.number({ required_error: "Manga ID required" }),
    chapterId: z.union([z.number(), z.string(), z.null()]).optional()
        .transform((val) => {
            if (typeof val === 'string') return parseInt(val, 10);
            return val;
        }),
});
