"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    totalCount: number;
    pageSize: number;
    currentPage: number;
}

export function Pagination({ totalCount, pageSize, currentPage }: PaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalPages <= 1) return null;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            if (endPage === totalPages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-4 bg-white border-t border-gray-200 sm:px-6 mt-4 rounded-b-xl">
            <div className="flex justify-between flex-1 sm:hidden">
                <Link
                    href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                    Previous
                </Link>
                <Link
                    href={currentPage < totalPages ? createPageURL(currentPage + 1) : "#"}
                    className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                    Next
                </Link>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{Math.min(totalCount, (currentPage - 1) * pageSize + 1)}</span> to{" "}
                        <span className="font-medium">{Math.min(totalCount, currentPage * pageSize)}</span> of{" "}
                        <span className="font-medium">{totalCount}</span> results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex shadow-sm -space-x-px rounded-md" aria-label="Pagination">
                        <Link
                            href={createPageURL(1)}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <span className="sr-only">First</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Link>
                        <Link
                            href={createPageURL(currentPage - 1)}
                            className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>

                        {getPageNumbers().map((page) => (
                            <Link
                                key={page}
                                href={createPageURL(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                        ? "z-10 bg-red-50 border-red-500 text-red-600"
                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                {page}
                            </Link>
                        ))}

                        <Link
                            href={createPageURL(currentPage + 1)}
                            className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={createPageURL(totalPages)}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            <span className="sr-only">Last</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}
