import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/5 dark:border-white/5 py-12 mt-20">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black/10 dark:bg-white/10 rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-black dark:bg-white rounded-full" />
            </div>
            <span className="text-sm font-medium tracking-tight opacity-50">Blog © 2026</span>
          </div>

          <nav className="flex items-center gap-8 text-sm text-neutral-500">
            <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">关于</Link>
            <Link href="/privacy" className="hover:text-black dark:hover:text-white transition-colors">隐私</Link>
            <Link href="https://github.com" className="hover:text-black dark:hover:text-white transition-colors">GitHub</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
