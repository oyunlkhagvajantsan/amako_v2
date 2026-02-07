import type { Metadata } from "next";
import { Montserrat, Noto_Sans } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0


const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Amako",
  description: "Юүри манга орчуулга",
  icons: {
    icon: "/favicon.png",
  },
};

import { Providers } from "./providers";
import Footer from "./components/Footer";
import SessionGuard from "./components/SessionGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.className} ${notoSans.variable} antialiased`}
      >
        <Providers>
          <SessionGuard>
            {children}
          </SessionGuard>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
