import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MangaStatus, Prisma } from "@prisma/client";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const genreIds = searchParams.getAll("genres").map(id => parseInt(id));
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const sort = searchParams.get("sort") || "latest"; // latest, popular, a-z

    const skip = (page - 1) * limit;

    const where: Prisma.MangaWhereInput = {
        isPublished: true,
        AND: [
            // Search by title (English or Mongolian)
            // Workaround for Postgres collation not supporting Cyrillic case-insensitivity:
            // Check for multiple case variations manually.
            search ? {
                OR: [
                    search.trim(),
                    search.trim().toLowerCase(),
                    search.trim().charAt(0).toUpperCase() + search.trim().slice(1).toLowerCase(),
                    search.trim().toUpperCase()
                ].filter((v, i, a) => a.indexOf(v) === i) // unique
                    .flatMap(term => [
                        { title: { contains: term, mode: "insensitive" } },
                        { titleMn: { contains: term, mode: "insensitive" } },
                    ])
            } : {},
            // Filter by Genres (must have ALL selected genres)
            genreIds.length > 0 ? {
                genres: {
                    some: {
                        id: { in: genreIds }
                    }
                }
            } : {},
            // Filter by Status
            status && status !== "ALL" ? {
                status: status as MangaStatus
            } : {},
            // Filter by Type
            type && type !== "ALL" ? {
                type: type as any
            } : {}
        ]
    };

    // Sort configuration
    let orderBy: Prisma.MangaOrderByWithRelationInput = {};
    if (sort === "latest") {
        orderBy = { updatedAt: "desc" };
    } else if (sort === "popular") {
        orderBy = { viewCount: "desc" };
    } else if (sort === "az") {
        orderBy = { title: "asc" };
    } else if (sort === "za") {
        orderBy = { title: "desc" };
    }

    try {
        const [mangas, total] = await Promise.all([
            prisma.manga.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    genres: true,
                    _count: {
                        select: { chapters: true }
                    }
                }
            }),
            prisma.manga.count({ where })
        ]);

        return NextResponse.json({
            mangas,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error("Filter API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
