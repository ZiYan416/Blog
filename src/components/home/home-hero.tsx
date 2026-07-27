"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CinematicHero } from "@/components/home/cinematic-hero";
import { DailyQuote } from "@/components/home/daily-quote";
import { useThemeSettings } from "@/hooks/use-theme-settings";
import { cn } from "@/lib/utils";

export function HomeHero() {
  const { cinematicHeroEnabled, isLoaded } = useThemeSettings();

  // If theme settings loaded and user disabled the Cinematic Hero theme
  if (isLoaded && !cinematicHeroEnabled) {
    return (
      <section className="relative w-full py-16 sm:py-24 md:py-32 px-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-neutral-50/50 via-neutral-100/30 to-transparent dark:from-neutral-900/40 dark:via-neutral-900/20 dark:to-transparent border-b border-black/5 dark:border-white/5 transition-all duration-700">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge / DailyQuote */}
          <div className="mb-4 inline-flex items-center justify-center">
            <DailyQuote />
          </div>

          {/* Heading with Instrument Serif */}
          <h1 className="font-serif-instrument italic text-4xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight max-w-4xl mb-6 text-neutral-900 dark:text-neutral-100">
            有些故事， <br className="hidden sm:inline" />
            <span className="not-italic font-normal">值得被认真记录</span>
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed font-sans text-neutral-600 dark:text-neutral-400 mb-8">
            用心感受生活的温度，用代码构建数字的花园。在这里，我们探讨技术，也分享生活的沉淀与感悟。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold transition-all shadow-md"
            >
              <Link href="/post">
                开始阅读文章
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full px-8 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <Link href="/about">关于作者</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Default Cinematic Hero
  return (
    <CinematicHero
      badgeText={<DailyQuote />}
      titleLine1="有些故事，"
      titleLine2="值得被认真记录"
      subtitle="用心感受生活的温度，用代码构建数字的花园。在这里，我们探讨技术，也分享生活的沉淀与感悟。"
      ctaNode={
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto rounded-full px-8 bg-white text-black hover:bg-white/90 font-semibold transition-all shadow-lg"
          >
            <Link href="/post">
              开始阅读文章
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto rounded-full px-8 liquid-glass text-white hover:bg-white/15 border-none transition-all"
          >
            <Link href="/about">关于作者</Link>
          </Button>
        </div>
      }
    />
  );
}
