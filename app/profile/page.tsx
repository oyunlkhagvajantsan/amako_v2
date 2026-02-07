import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/app/components/Header";
import { redirect } from "next/navigation";
import ProfileTabs from "@/app/components/profile/ProfileTabs";
import { UserFull } from "@/lib/types";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            paymentRequests: {
                orderBy: { createdAt: "desc" },
            },
            readHistory: {
                orderBy: { updatedAt: "desc" },
                include: {
                    chapter: {
                        include: {
                            manga: true
                        }
                    }
                }
            },
            likes: {
                include: {
                    manga: true
                }
            }
        }
    }) as UserFull | null;

    if (!user) return null;

    const isSubscribed = user.isSubscribed && user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();
    const daysLeft = isSubscribed && user.subscriptionEnd
        ? Math.ceil((new Date(user.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <ProfileTabs
                    user={user}
                    isSubscribed={!!isSubscribed}
                    daysLeft={daysLeft}
                />
            </main>
        </div>
    );
}
