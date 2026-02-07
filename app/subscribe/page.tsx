import Link from "next/link";
import Header from "@/app/components/Header";
import { PRICING, formatPrice } from "@/lib/pricing";

export default function SubscribePage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Эрх сунгах
                    </h1>
                    <p className="text-muted">
                        Хүссэн хугацаагаа сонгон эрхээ идэвхжүүлээрэй.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
                    {/* 1 Month Plan */}
                    <div className="bg-surface-elevated rounded-xl shadow-lg border border-primary relative hover:shadow-xl transition-all flex flex-col items-center justify-center p-4 group">
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-foreground mb-1">1 сар</h3>
                            <div className="flex items-baseline justify-center">
                                <span className="text-2xl font-extrabold tracking-tight text-primary">{formatPrice(PRICING[1])}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2 Month Plan */}
                    <div className="bg-surface-elevated rounded-xl shadow-lg border border-primary relative hover:shadow-xl transition-all flex flex-col items-center justify-center p-4 group">
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-foreground mb-1">2 сар</h3>
                            <div className="flex items-baseline justify-center">
                                <span className="text-2xl font-extrabold tracking-tight text-primary">{formatPrice(PRICING[2])}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3 Month Plan */}
                    <div className="bg-surface-elevated rounded-xl shadow-lg border border-primary relative hover:shadow-xl transition-all flex flex-col items-center justify-center p-4 bg-primary/5 group">
                        <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Хэмнэлттэй
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-foreground mb-1">3 сар</h3>
                            <div className="flex items-baseline justify-center">
                                <span className="text-2xl font-extrabold tracking-tight text-primary">{formatPrice(PRICING[3])}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href="/subscribe/payment"
                        className="inline-flex items-center justify-center px-10 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Төлбөр төлөх
                    </Link>
                </div>
            </main>
        </div>
    );
}

