import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-0">
            <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-8 mb-6">
                    <Image
                        src="/uploads/images/logo_white.webp"
                        alt="Amako"
                        fill
                        className="object-contain"
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm text-gray-400">
                    <Link href="#" className="hover:text-white transition-colors">Бидний тухай</Link>
                    <Link href="#" className="hover:text-white transition-colors">Холбоо барих</Link>
                    {/* <Link href="#" className="hover:text-white transition-colors">Үйлчилгээний нөхцөл</Link> */}
                </div>
                <p className="text-gray-500 text-xs">© 2026 Аmako Manga.</p>
            </div>
        </footer>
    );
}
