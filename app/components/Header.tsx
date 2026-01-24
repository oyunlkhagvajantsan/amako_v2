"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

import { Menu, X, User, LogOut, Crown, LogIn } from "lucide-react";
import Image from "next/image";

export default function Header({ isSticky = true }: { isSticky?: boolean }) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className={`${isSticky ? 'sticky top-0' : 'relative'} left-0 right-0 z-50 bg-white border-b border-gray-200`}>
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-24 h-9">
                <Image
                  src="/uploads/images/logo_text.webp"
                  alt="Amako"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/manga" className="text-gray-600 hover:text-gray-900 transition-colors">
            Гаргалт
          </Link>
          <Link href="/genres" className="text-gray-600 hover:text-gray-900 transition-colors">
            Хайх
          </Link>
          {(session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR") && (
            <Link href="/amako-portal-v7" className="text-[#d8454f] font-medium hover:text-[#c13a44] transition-colors">
              Админ
            </Link>
          )}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button
                className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)} // Delay close for link clicks
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#d8454f] font-bold ring-2 ring-transparent hover:ring-[#d8454f]/20 transition-all">
                  <User size={18} />
                </div>
              </button>

              {/* Desktop Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full pt-2 w-48 hidden md:block">
                  <div className="bg-white rounded-md shadow-lg py-1 border border-gray-100">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User size={16} /> Профайл
                    </Link>
                    <Link href="/subscribe" className="flex items-center gap-2 px-4 py-2 text-sm text-[#d8454f] font-medium hover:bg-gray-50">
                      <Crown size={16} /> Эрх сунгах
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: window.location.origin })}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <LogOut size={16} /> Гарах
                    </button>
                  </div>
                </div>
              )}
              {/* Mobile User Icon (Opens Menu or Profile) */}
              <Link href="/profile" className="md:hidden w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#d8454f] font-bold">
                <User size={18} />
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Нэвтрэх
              </Link>
              <Link
                href="/signup"
                className="hidden md:block px-4 py-2 text-white rounded-lg transition-all text-sm font-medium hover:bg-[#c13a44]"
                style={{ backgroundColor: '#d8454f' }}
              >
                Бүртгүүлэх
              </Link>
              {/* Mobile Auth (Just Login Icon) */}
              <Link href="/login" className="md:hidden text-gray-700">
                <User size={24} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-64 bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                    <Image
                      src="/uploads/images/logo_icon.webp"
                      alt="Amako"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Amako</span>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col px-4 space-y-4">
                <Link href="/" className="text-lg font-medium text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Нүүр</Link>
                <Link href="/manga" className="text-lg font-medium text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Гаргалт</Link>
                <Link href="/genres" className="text-lg font-medium text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Хайх</Link>
                {(session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR") && (
                  <Link href="/amako-portal-v7" className="text-lg font-medium text-[#d8454f]" onClick={() => setIsMobileMenuOpen(false)}>
                    Админ Панел
                  </Link>
                )}

                <hr className="border-gray-100" />

                {session ? (
                  <>
                    <Link href="/profile" className="flex items-center gap-3 text-lg font-medium text-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                      <User size={20} /> Профайл
                    </Link>
                    <Link href="/subscribe" className="flex items-center gap-3 text-lg font-medium text-[#d8454f]" onClick={() => setIsMobileMenuOpen(false)}>
                      <Crown size={20} /> Эрх сунгах
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: window.location.origin });
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full text-left text-lg font-medium text-red-600"
                    >
                      <LogOut size={20} /> Гарах
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link
                      href="/login"
                      className="w-full py-2.5 text-center border border-gray-300 rounded-lg text-gray-700 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Нэвтрэх
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full py-2.5 text-center bg-[#d8454f] text-white rounded-lg font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Бүртгүүлэх
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
