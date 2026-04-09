import { prisma } from "@/lib/prisma";
import DashboardClient from "./components/DashboardClient";
import { getDashboardStats } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Initial fetch for 30 days
    const initialData = await getDashboardStats(30);

    // Fetch top 10 most viewed mangas for all time
    const topMangas = await prisma.manga.findMany({
        orderBy: { viewCount: "desc" },
        take: 10,
        select: { id: true, title: true, coverImage: true, viewCount: true, author: true }
    });

    return (
        <div>
            <DashboardClient initialData={initialData} topMangas={topMangas} isAdmin={isAdmin} />
        </div>
    );
}
