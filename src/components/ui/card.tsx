import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("hisab-card p-4 sm:p-5", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-3 flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("font-display text-lg font-medium tracking-tight text-ink", className)} {...props} />;
}

export function CardHint({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}
