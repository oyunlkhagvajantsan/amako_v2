import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditMangaForm from "./EditMangaForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EditMangaPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const manga = await prisma.manga.findUnique({
        where: { id: parseInt(id) },
        include: {
            genres: true, // Fetch connected genres
        },
    });

    if (!manga) {
        notFound();
    }

    const allGenres = await prisma.genre.findMany({
        orderBy: { name: "asc" },
    });

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    return <EditMangaForm manga={manga as any} allGenres={allGenres as any[]} isAdmin={isAdmin} />;
}
