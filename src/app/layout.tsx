import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Blog",
  description: "A modern personal blog built with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[#fafafa] dark:bg-[#050505] text-neutral-900 dark:text-neutral-100 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black antialiased`}>
        <Navbar />
        <main className="pt-16 min-h-[calc(100vh-64px-160px)]">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
