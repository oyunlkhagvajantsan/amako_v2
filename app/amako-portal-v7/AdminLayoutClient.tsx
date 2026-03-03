"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard, PlusCircle, FilePlus, Library, Layers, CreditCard, MessageSquare, Users, LogOut } from "lucide-react";

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigation = [
        { name: "Хяналтын самбар", href: "/", icon: LayoutDashboard },
        { name: "Гаргалт нэмэх", href: "/manga/create", icon: PlusCircle },
        { name: "Бүлэг нэмэх", href: "/chapters/create", icon: FilePlus },
        { name: "Гаргалтууд", href: "/manga", icon: Library },
        { name: "Бүлгүүд", href: "/chapters", icon: Layers },
        { name: "Төлбөр", href: "/payments", icon: CreditCard },
        { name: "Сэтгэгдэл", href: "/comments", icon: MessageSquare },
        { name: "Хэрэглэгчид", href: "/users", icon: Users },
    ];

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="light min-h-screen bg-gray-50 flex flex-col text-gray-900">
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 md:hidden sticky top-0 z-30">
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                        <Image
                            src="/uploads/images/logo_icon.webp"
                            alt="Amako Icon"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="text-xl font-bold text-gray-900">Amako Admin</span>
                </Link>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <Menu size={24} />
                </button>
            </header>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
                    transform transition-transform duration-200 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                `}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                            <Image
                                src="/uploads/images/logo_icon.webp"
                                alt="Amako Icon"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Amako Admin</span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? "bg-red-50 text-[#d8454f]"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-200">
                        <button
                            onClick={() => signOut({ callbackUrl: window.location.origin })}
                            className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={18} />
                            Гарах
                        </button>
                    </div>
                </nav>
            </aside>

            <main className="flex-1 p-4 md:p-8 overflow-x-hidden md:ml-64">
                {children}
            </main>
        </div >
    );
}
