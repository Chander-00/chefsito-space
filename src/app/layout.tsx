import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainHeader from "@/components/mainHeader/header";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Chefsito Space - Anyone Can Cook",
    template: "%s | Chefsito Space",
  },
  description: "Discover, create and share recipes from around the world. Search by ingredients, save your favorites, and plan your meals.",
  openGraph: {
    type: "website",
    siteName: "Chefsito Space",
    title: "Chefsito Space - Anyone Can Cook",
    description: "Discover, create and share recipes from around the world.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark`}>
        <Providers>
          <MainHeader></MainHeader>
          {children}
        </Providers>
      </body>
    </html>
  );
}
