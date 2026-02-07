import Link from "next/link";
import Image from "next/image";
import { Facebook } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#111929] text-gray-400 py-12 mt-0 border-t border-white/5">
            <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-24 h-8">
                        <Image
                            src="/uploads/images/logo_white.webp"
                            alt="Amako"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="flex gap-4 border-l border-gray-700 pl-6">
                        <Link
                            href="https://www.facebook.com/AMAyuriPage"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Facebook Page 1"
                        >
                            <Facebook size={20} />
                        </Link>
                        <Link
                            href="https://www.facebook.com/profile.php?id=100068024407551"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Facebook Page 2"
                        >
                            <Facebook size={20} />
                        </Link>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
                    {/* <Link href="#" className="hover:text-white transition-colors">Бидний тухай</Link> */}

                    {/* <Link href="#" className="hover:text-white transition-colors">Үйлчилгээний нөхцөл</Link> */}
                    <p className="text-gray-600 text-xs">© 2026 Аmako Manga.</p>
                </div>

            </div>
        </footer>
    );
}
