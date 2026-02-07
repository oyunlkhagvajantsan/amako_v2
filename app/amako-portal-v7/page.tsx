import { UserRepository } from "@/lib/repositories/UserRepository";
import { MangaRepository } from "@/lib/repositories/MangaRepository";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
    const userCount = await UserRepository.count();
    const mangaCount = await MangaRepository.count();
    const verifiedCount = await UserRepository.countSubscribed();
    const chapterCount = await prisma.chapter.count();
    const pendingPaymentCount = await prisma.paymentRequest.count({ where: { status: 'PENDING' } });
    const commentCount = await prisma.comment.count();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Хяналтын самбар</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {/* Stat Card 1 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Нийт хэрэглэгчид</h3>
                    <p className="text-3xl font-bold text-gray-900">{userCount}</p>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Нийт гаргалт</h3>
                    <p className="text-3xl font-bold text-gray-900">{mangaCount}</p>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Нийт бүлэг</h3>
                    <p className="text-3xl font-bold text-gray-900">{chapterCount}</p>
                </div>

                {/* Stat Card 4 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Баталгаажсан хэрэглэгчид</h3>
                    <p className="text-3xl font-bold text-gray-900">{verifiedCount}</p>
                </div>

                {/* Stat Card 5 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Хүлээгдэж буй төлбөр</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-gray-900">{pendingPaymentCount}</p>
                        {pendingPaymentCount > 0 && (
                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                    </div>
                </div>

                {/* Stat Card 6 */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Нийт сэтгэгдэл</h3>
                    <p className="text-3xl font-bold text-gray-900">{commentCount}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Шуурхай үйлдэл</h2>
                <div className="flex gap-4">
                    <a
                        href="/amako-portal-v7/manga/create"
                        className="px-4 py-2 bg-[#d8454f] hover:bg-[#c13a44] text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        + Гаргалт нэмэх
                    </a>
                </div>
            </div>
        </div>
    );
}
