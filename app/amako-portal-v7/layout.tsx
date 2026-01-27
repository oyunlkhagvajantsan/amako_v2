import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login?callbackUrl=/amako-portal-v7");
    }

    if (session.user?.role !== "ADMIN" && session.user?.role !== "MODERATOR") {
        redirect("/");
    }

    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
