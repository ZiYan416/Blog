
import { Metadata } from "next";
import Link from "next/link";
import { Github, Mail, ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Me",
  description: "Developer, Designer, Creator.",
};

export default function AboutPage() {
  return (
    <div className="flex-1 flex items-start md:items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-700 min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-5xl h-auto md:h-[600px] py-4 md:py-0">
        <div className="grid grid-cols-2 md:grid-cols-3 md:grid-rows-3 gap-4 md:gap-6 h-full">

          {/* Card 1: Avatar & Profile - Left Column (Spans 2 Rows) */}
          <div className="order-1 md:order-none col-span-2 md:col-span-1 md:row-span-3 rounded-[2rem] bg-white dark:bg-neutral-900 border border-black/5 dark:border-white/5 p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden min-h-[300px] md:min-h-0">
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 to-transparent dark:from-neutral-800/50 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Circular Avatar */}
            <div className="relative w-32 h-32 md:w-48 md:h-48 mb-6 rounded-full border-4 border-white dark:border-neutral-800 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                <Image src="/avatar.jpg" alt="My Avatar" fill className="object-cover" />
              </div>
            </div>

            <div className="relative z-10">
              <h1 className="text-3xl font-black tracking-tight text-black dark:text-white mb-2">荔冰酪 <br/> Lycheeling</h1>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">College Student</p>
            </div>
          </div>

          {/* Card 2: Blog Intro - Top Right (Spans 2 Cols) */}
          <div className="order-2 md:order-none col-span-2 md:col-span-2 md:row-span-2 rounded-[2rem] bg-neutral-900 dark:bg-white text-white dark:text-black p-8 py-10 md:py-8 flex flex-col justify-center relative overflow-hidden group border border-black/5 dark:border-white/5 min-h-[250px] md:min-h-0">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 dark:bg-black/5 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-white/60 dark:text-black/60 text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>About This Project</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-tight">
                一个探索技术与美学的极简主义博客
              </h2>
              <p className="text-white/70 dark:text-black/70 text-sm md:text-base leading-relaxed max-w-xl">
                基于 Next.js 14 与 Supabase 构建。在这里，我记录开发路上的思考，分享对现代 Web 技术的见解。
              </p>
              <h2 className="text-xl md:text-2xl font-bold leading-tight pt-2">
                关于我
              </h2>
              <p className="text-white/70 dark:text-black/70 text-sm md:text-base leading-relaxed max-w-xl">
                找实习......
              </p>
            </div>
          </div>

          {/* Card 3: GitHub - Bottom Middle (1x1) */}
          <Link
            href="https://github.com"
            target="_blank"
            className="order-3 md:order-none col-span-1 md:col-span-1 md:row-span-1 group relative rounded-[2rem] bg-[#181717] dark:bg-white text-white dark:text-black p-6 flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-transform duration-300 border border-black/5 min-h-[160px] md:min-h-0"
          >
            <div className="flex justify-between items-start z-10">
              <Github className="w-8 h-8" />
              <ArrowUpRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <div className="z-10">
              <p className="font-bold text-lg">GitHub</p>
              <p className="text-xs text-neutral-400">View Source</p>
            </div>
          </Link>

          {/* Card 4: Email - Bottom Right (1x1) */}
          <Link
            href="mailto:hello@example.com"
            className="order-4 md:order-none col-span-1 md:col-span-1 md:row-span-1 group relative rounded-[2rem] bg-blue-300 dark:bg-purple-300 text-white p-6 flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-transform duration-300 border border-black/5 min-h-[160px] md:min-h-0"
          >
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors" />
            <div className="flex justify-between items-start z-10">
              <Mail className="w-8 h-8" />
              <ArrowUpRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <div className="z-10">
              <p className="font-bold text-lg">Contact</p>
              <p className="text-xs text-orange-100">Say Hello</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
