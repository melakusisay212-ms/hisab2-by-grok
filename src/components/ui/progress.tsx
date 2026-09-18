import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "accent",
}: {
  value: number;
  className?: string;
  tone?: "accent" | "income" | "expense" | "warn";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const bar =
    tone === "expense"
      ? "bg-expense"
      : tone === "income"
        ? "bg-income"
        : tone === "warn"
          ? "bg-warn"
          : "bg-accent";
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-bg-warm", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-300 ease-[var(--ease-out)]", bar)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
