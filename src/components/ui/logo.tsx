import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    xs: "w-5 h-5 text-xs",
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-lg",
    lg: "w-12 h-12 text-2xl",
  };

  const radiusClasses = {
    xs: "rounded",
    sm: "rounded-md",
    md: "rounded-xl",
    lg: "rounded-2xl",
  };

  const dotSizes = {
    xs: "w-1 h-1 bottom-0.5 right-0.5",
    sm: "w-1.5 h-1.5 bottom-0.5 right-0.5",
    md: "w-2.5 h-2.5 bottom-1 right-1",
    lg: "w-3.5 h-3.5 bottom-1.5 right-1.5",
  };

  return (
    <div
      className={cn("relative flex items-center justify-center bg-black dark:bg-white text-white dark:text-black font-bold tracking-tighter select-none shadow-sm", sizeClasses[size], radiusClasses[size], className)}
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <span className="relative z-10 italic leading-none">B</span>
      <div className={cn("absolute bg-white dark:bg-black rounded-full", dotSizes[size])} />
    </div>
  );
}
