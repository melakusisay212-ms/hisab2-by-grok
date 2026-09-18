const birr = new Intl.NumberFormat("en-ET", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const birrFull = new Intl.NumberFormat("en-ET", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBirr(amount: number, opts: { signed?: boolean; compact?: boolean } = {}): string {
  const abs = Math.abs(amount);
  const formatted = opts.compact && abs >= 10000
    ? compactBirr(abs)
    : abs >= 100
      ? birr.format(Math.round(abs * 100) / 100)
      : birrFull.format(abs);
  const body = `ብር ${formatted}`;
  if (!opts.signed) return body;
  if (amount > 0) return `+${body}`;
  if (amount < 0) return `−${body}`;
  return body;
}

function compactBirr(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}k`;
  return birr.format(n);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${Math.round(value * 100)}%`;
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}
