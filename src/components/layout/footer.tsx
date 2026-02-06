import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/5 py-8 md:py-12 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
          <div className="flex items-center gap-2.5">
            <Logo size="xs" className="opacity-50 grayscale" />
            <span className="text-sm font-medium text-neutral-500">
              <span className="font-serif italic mr-1">Blog</span>
              © 2026
            </span>
          </div>

          <nav className="flex items-center gap-6 md:gap-8 text-sm text-neutral-500 font-medium">
            <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">关于</Link>
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">隐私</Link>
            <Link
              href="https://github.com/ZiYan416/Blog"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black dark:hover:text-white transition-colors"
            >
              GitHub
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
