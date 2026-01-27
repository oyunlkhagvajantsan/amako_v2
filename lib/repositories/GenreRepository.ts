import { prisma } from "@/lib/prisma";

export class GenreRepository {
    static async findAll() {
        return prisma.genre.findMany({
            orderBy: { name: "asc" },
        });
    }

    static async findById(id: number) {
        return prisma.genre.findUnique({
            where: { id }
        });
    }

    static async findBySlug(slug: string) {
        return prisma.genre.findUnique({
            where: { slug }
        });
    }
}
