import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic';
export const revalidate = 0


const inter = Inter({
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
