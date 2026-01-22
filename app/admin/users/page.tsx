import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Хэрэглэгчид ({users.length})</h1>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm text-gray-500">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Subs Ends</th>
                            <th className="px-6 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => {
                            const isSubscribed = user.isSubscribed && user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();
                            const daysLeft = isSubscribed && user.subscriptionEnd
                                ? Math.ceil((new Date(user.subscriptionEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                : 0;

                            return (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isSubscribed ? (
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                                Active ({daysLeft} days)
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
