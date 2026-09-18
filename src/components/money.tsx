import { cn } from "@/lib/utils";
import { formatBirr } from "@/lib/format";

export function Money({
  amount,
  signed = false,
  compact = false,
  className,
  tone,
}: {
  amount: number;
  signed?: boolean;
  compact?: boolean;
  className?: string;
  tone?: "income" | "expense" | "ink" | "muted";
}) {
  const resolved =
    tone ??
    (signed ? (amount > 0 ? "income" : amount < 0 ? "expense" : "ink") : "ink");
  const color =
    resolved === "income"
      ? "text-income"
      : resolved === "expense"
        ? "text-expense"
        : resolved === "muted"
          ? "text-muted"
          : "text-ink";
  return (
    <span className={cn("tabular tracking-tight", color, className)}>
      {formatBirr(signed ? amount : Math.abs(amount), { signed, compact })}
    </span>
  );
}
