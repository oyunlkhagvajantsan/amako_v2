import { UserRepository } from "@/lib/repositories/UserRepository";
import { MangaRepository } from "@/lib/repositories/MangaRepository";

export default async function AdminDashboard() {
    const userCount = await UserRepository.count();
    const mangaCount = await MangaRepository.count();
    const verifiedCount = await UserRepository.countSubscribed();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Хяналтын самбар</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Баталгаажсан хэрэглэгчид</h3>
                    <p className="text-3xl font-bold text-gray-900">{verifiedCount}</p>
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
