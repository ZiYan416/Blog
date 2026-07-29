import type { CSSProperties } from "react";

export const chartGridStroke = "hsl(var(--border))";
export const chartAxisStroke = "hsl(var(--muted-foreground))";

export const chartTooltipContentStyle: CSSProperties = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgb(0 0 0 / 0.16)",
  color: "hsl(var(--popover-foreground))",
  fontSize: "12px",
  padding: "8px 12px",
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: "hsl(var(--popover-foreground))",
};

export const chartTooltipItemStyle: CSSProperties = {
  color: "hsl(var(--popover-foreground))",
};
