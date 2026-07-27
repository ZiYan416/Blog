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
      <section className="relative w-full mx-auto px-6 pt-12 md:pt-24 pb-16 text-center overflow-visible isolate">
        <div className="relative max-w-4xl mx-auto overflow-visible">
          {/* Badge / DailyQuote with Switch Light Cone Beam Animation */}
          <DailyQuote showLightCone={true} />

          {/* Heading */}
          <h1 className="text-4xl md:text-7xl font-black font-serif tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 dark:drop-shadow-[0_10px_35px_rgba(251,191,36,0.25)] transition-all">
            有些故事<span className="inline-block -mr-[1em]">，</span><br />
            <span className="text-neutral-400 dark:text-neutral-600 dark:drop-shadow-none">值得被记录<span className="inline-block -mr-[1em]">。</span></span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-xl text-neutral-500 font-serif max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            用心感受生活的温度，用代码构建数字的花园。在这里，我们探讨技术，也分享生活<span className="inline-block -mr-[1em]">。</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-8 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">
              <Link href="/post">
                开始阅读
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
              <Link href="/about">了解更多</Link>
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
