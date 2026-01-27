import { NextResponse } from "next/server";
import { GenreRepository } from "@/lib/repositories/GenreRepository";

export async function GET() {
    try {
        const genres = await GenreRepository.findAll();
        return NextResponse.json(genres);
    } catch (error) {
        console.error("Genres fetch error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
