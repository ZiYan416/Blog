import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AboutHero } from "@/features/about/components/about-hero";

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "关于 SuziJay",
  description:
    "你好，我是 SuziJay。写代码，偶尔也写点 Bug，再做些顺手的小东西。",
};

export default function AboutPage() {
  return (
    <div className={geist.variable}>
      <AboutHero />
    </div>
  );
}
