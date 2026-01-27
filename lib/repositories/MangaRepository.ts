import { prisma } from "@/lib/prisma";
import { Prisma, Manga } from "@prisma/client";

export class MangaRepository {
    /**
     * Professional Repository Pattern implementation for Manga entity.
     * Following SOLID principles (SRP, DIP).
     */

    static async findById(id: number, includeGenres = false) {
        return prisma.manga.findUnique({
            where: { id },
            include: {
                genres: includeGenres,
            }
        });
    }

    static async findAll(params?: {
        take?: number;
        skip?: number;
        orderBy?: Prisma.MangaOrderByWithRelationInput;
    }) {
        return prisma.manga.findMany({
            ...params,
            include: {
                genres: true,
                _count: {
                    select: { chapters: true }
                }
            }
        });
    }

    static async create(data: Prisma.MangaCreateInput) {
        return prisma.manga.create({ data });
    }

    static async update(id: number, data: Prisma.MangaUpdateInput) {
        return prisma.manga.update({
            where: { id },
            data,
        });
    }

    static async delete(id: number) {
        return prisma.manga.delete({
            where: { id },
        });
    }

    static async count() {
        return prisma.manga.count();
    }
}
