import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function SiteBrandName({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn(className)} {...props}>
      <span className="font-pixel text-[1.15em] not-italic font-semibold">Jay</span>
      <span className="font-serif italic">{"'s Blog"}</span>
    </span>
  );
}
