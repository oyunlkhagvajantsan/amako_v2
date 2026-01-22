import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/app/components/Header";
import { redirect } from "next/navigation";
import Image from "next/image";
import { User, BookOpen } from "lucide-react";
import ChangePasswordForm from "./ChangePasswordForm";

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
                take: 5
            },
            readHistory: {
                orderBy: { readAt: "desc" },
                take: 10,
                include: {
                    chapter: {
                        include: {
                            manga: true
                        }
                    }
                }
            }
        }
    });

    if (!user) return null;

    const isSubscribed = user.isSubscribed && user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();
    const daysLeft = isSubscribed && user.subscriptionEnd
        ? Math.ceil((new Date(user.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {/* <h1 className="text-3xl font-bold mb-8 text-gray-900">Профайл</h1> */}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-[#d8454f]">
                                <User size={40} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-500">{user.email}</p>
                                <div className="mt-2">
                                    {isSubscribed ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Идэвхтэй ({daysLeft} хоног)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Идэвхгүй
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="font-medium text-gray-900 mb-4">Төлөв</h3>
                            {isSubscribed ? (
                                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-green-800 font-medium">Таны эрх дуусах хугацаа:</p>
                                            <p className="text-2xl font-bold text-green-900 mt-1">
                                                {new Date(user.subscriptionEnd!).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                                    <p className="text-gray-600 mb-2">Танд идэвхтэй эрх байхгүй байна.</p>
                                    <a href="/subscribe" className="text-[#d8454f] font-medium hover:underline">
                                        Эрх авах →
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <BookOpen size={20} className="text-[#d8454f]" />
                        <h3 className="font-bold text-gray-900">Сүүлд уншсан</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {((user as any).readHistory || []).length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                Түүх байхгүй байна.
                            </div>
                        ) : (
                            ((user as any).readHistory || []).map((history: any) => (
                                <a
                                    key={history.id}
                                    href={`/manga/${history.chapter?.mangaId}/read/${history.chapterId}`}
                                    className="block hover:bg-gray-50 transition-colors p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {history.chapter?.manga?.coverImage && (
                                                <div className="w-10 h-14 relative rounded overflow-hidden flex-shrink-0 bg-gray-200">
                                                    <Image
                                                        src={history.chapter.manga.coverImage}
                                                        alt={history.chapter.manga.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-gray-900 line-clamp-1">{history.chapter?.manga?.titleMn || history.chapter?.manga?.title}</p>
                                                <p className="text-sm text-gray-600">
                                                    {history.chapter?.chapterNumber}-р бүлэг
                                                    {history.chapter?.title && ` - ${history.chapter.title}`}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                            {new Date(history.readAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Төлбөрийн түүх</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {((user as any).paymentRequests || []).length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                Түүх байхгүй байна.
                            </div>
                        ) : (
                            ((user as any).paymentRequests || []).map((req: any) => (
                                <div key={req.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{req.months} сарын эрх</p>
                                        <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{req.amount.toLocaleString()}₮</p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${req.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                            req.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <ChangePasswordForm />
            </main>
        </div>
    );
}
