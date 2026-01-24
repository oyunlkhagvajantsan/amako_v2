import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic';


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
        {children}
        <Footer />
      </body>
    </html>
  );
}
