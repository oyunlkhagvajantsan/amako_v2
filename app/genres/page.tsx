import { Suspense } from "react";
import GenresClient from "./GenresClient";
import Header from "@/app/components/Header";

export const dynamic = "force-dynamic";

export default function GenresPage() {
    return (
        <Suspense fallback={<GenresLoading />}>
            <GenresClient />
        </Suspense>
    );
}

function GenresLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Skeleton */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96 animate-pulse" />
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="flex-1">
                        <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[2/3] bg-gray-200 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
