"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isImmersivePage = pathname === "/about";

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      {!isImmersivePage && <Footer />}
    </>
  );
}
