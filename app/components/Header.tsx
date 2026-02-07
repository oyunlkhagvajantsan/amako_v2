"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Menu, X, User, LogOut, Crown, LogIn, Search, History, Bell } from "lucide-react";
import { useSearchHistory } from "@/lib/hooks/useSearchHistory";
import Image from "next/image";
import NotificationBell from "./notifications/NotificationBell";
import ThemeToggle from "./ThemeToggle";

export default function Header({ isSticky = true, hideBorder = false }: { isSticky?: boolean; hideBorder?: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { history, addSearchTerm, removeSearchTerm, clearHistory } = useSearchHistory();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSearchDropdownOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleSearch = (term?: string) => {
    const query = term || headerSearchQuery;
    if (query.trim()) {
      addSearchTerm(query);
      router.push(`/manga?search=${encodeURIComponent(query)}`);
      setIsSearchDropdownOpen(false);
      setHeaderSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <header className={`${isSticky ? 'sticky top-0' : 'relative'} left-0 right-0 z-[60] bg-background/80 backdrop-blur-md ${hideBorder ? '' : 'border-b border-border'}`}>
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2 text-foreground/70 hover:bg-surface rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

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
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-muted hover:text-foreground transition-colors">
              Нүүр
            </Link>
            <Link href="/manga" className="text-muted hover:text-foreground transition-colors">
              Гаргалт
            </Link>
          </div>

          {/* Icons Context */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {/* Search Button with History Dropdown */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
                className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface rounded-full transition-all duration-300 relative"
              >
                <Search size={20} />
              </button>

              {isSearchDropdownOpen && (
                <div className="fixed inset-x-4 top-[64px] md:absolute md:inset-auto md:right-0 md:top-full md:pt-2 md:w-80 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-surface rounded-xl shadow-2xl border border-border overflow-hidden">
                    {/* Search Input In Dropdown */}
                    <div className="p-3 border-b border-border bg-surface-elevated">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                          ref={inputRef}
                          type="text"
                          value={headerSearchQuery}
                          onChange={(e) => setHeaderSearchQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Хайх..."
                          className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                    </div>

                    <div className="p-3 border-b border-border flex justify-between items-center bg-surface-elevated">
                      <span className="text-xs font-bold text-muted uppercase tracking-tight font-sans">Сүүлийн хайлтууд</span>
                      <button
                        onClick={() => { router.push('/manga'); setIsSearchDropdownOpen(false); }}
                        className="text-xs text-[#d8454f] hover:underline font-medium"
                      >
                        Бүгд
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {history.length > 0 ? (
                        <>
                          {history.map((term, index) => (
                            <div
                              key={index}
                              className="group flex items-center px-4 py-3 hover:bg-surface cursor-pointer transition-colors"
                              onClick={() => handleSearch(term)}
                            >
                              <div className="flex items-center flex-1 min-w-0">
                                <History size={16} className="text-muted mr-3 group-hover:text-primary shrink-0" />
                                <span className="truncate text-sm text-foreground/80 group-hover:text-foreground">{term}</span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeSearchTerm(term); }}
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-surface-elevated rounded-full transition-all ml-2"
                              >
                                <X size={14} className="text-muted" />
                              </button>
                            </div>
                          ))}
                          <div className="p-2 border-t border-border flex justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                              className="text-xs text-muted hover:text-foreground font-medium py-1 transition-colors"
                            >
                              Түүх цэвэрлэх
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center">
                          <Search size={32} className="mx-auto text-muted/20 mb-2" />
                          <p className="text-sm text-muted">Хайлтын түүх хоосон байна</p>
                          <Link
                            href="/manga"
                            onClick={() => setIsSearchDropdownOpen(false)}
                            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                          >
                            Шууд хайх
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {session ? (
              <div className="flex items-center gap-3">
                <NotificationBell />

                <div className="relative" ref={userRef}>
                  <button
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center text-primary font-bold ring-2 ring-transparent hover:ring-primary/20 transition-all border border-border">
                      <User size={18} />
                    </div>
                  </button>

                  {/* Desktop Dropdown */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full pt-2 w-48 hidden md:block">
                      <div className="bg-surface-elevated rounded-md shadow-lg py-1 border border-border">
                        <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:bg-surface hover:text-foreground">
                          <User size={16} /> Профайл
                        </Link>
                        <Link href="/subscribe" className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-medium hover:bg-surface">
                          <Crown size={16} /> Эрх сунгах
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: window.location.origin })}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-error hover:bg-surface"
                        >
                          <LogOut size={16} /> Гарах
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Mobile User Icon */}
                  <Link href="/profile" className="md:hidden w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center text-primary font-bold border border-border">
                    <User size={18} />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:block text-sm text-muted hover:text-foreground transition-colors"
                >
                  Нэвтрэх
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:block px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all text-sm font-medium shadow-sm active:scale-95"
                >
                  Бүртгүүлэх
                </Link>
                {/* Mobile Auth (Just Login Icon) */}
                <Link href="/login" className="md:hidden text-muted hover:text-foreground">
                  <User size={24} />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay - Outside Header to avoid backdrop-filter constraints */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-64 bg-background h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
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
                  <span className="text-xl font-bold text-foreground">Amako</span>
                </div>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-muted hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col px-4 space-y-4">
                <Link href="/" className="text-lg font-medium text-muted hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Нүүр</Link>
                <Link href="/manga" className="text-lg font-medium text-muted hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>Гаргалт</Link>

                <hr className="border-border" />

                {session ? (
                  <>
                    <Link href="/profile" className="flex items-center gap-3 text-lg font-medium text-muted hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
                      <User size={20} /> Профайл
                    </Link>
                    <Link href="/subscribe" className="flex items-center gap-3 text-lg font-medium text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                      <Crown size={20} /> Эрх сунгах
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: window.location.origin });
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full text-left text-lg font-medium text-error"
                    >
                      <LogOut size={20} /> Гарах
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link
                      href="/login"
                      className="w-full py-2.5 text-center border border-border rounded-lg text-muted font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Нэвтрэх
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full py-2.5 text-center bg-primary text-white rounded-lg font-medium shadow-sm active:scale-[0.98]"
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
    </>
  );
}
