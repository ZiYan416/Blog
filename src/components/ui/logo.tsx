import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className={cn("relative flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold font-serif tracking-tighter select-none", sizeClasses[size], className)}>
      <span className="relative z-10 italic">B</span>
      <div className={cn("absolute bottom-1 right-1 bg-white dark:bg-black rounded-full", dotSizes[size])} />
    </div>
  );
}
