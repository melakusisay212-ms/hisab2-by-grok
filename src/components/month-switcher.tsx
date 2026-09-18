import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addEthiopianMonths,
  formatGregorianShort,
  monthLabel,
  toGregorian,
  todayEthiopian,
  endOfEthiopianMonth,
  startOfEthiopianMonth,
} from "@/lib/ethiopian";
import { useFinanceStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function MonthSwitcher() {
  const year = useFinanceStore((s) => s.viewYear);
  const month = useFinanceStore((s) => s.viewMonth);
  const geez = useFinanceStore((s) => s.geezNumerals);
  const setViewMonth = useFinanceStore((s) => s.setViewMonth);
  const label = monthLabel(year, month, geez);
  const start = startOfEthiopianMonth({ year, month });
  const end = endOfEthiopianMonth({ year, month });
  const gregRange = `${formatGregorianShort(toGregorian(start))} – ${formatGregorianShort(toGregorian(end))}`;
  const today = todayEthiopian();

  function shift(delta: number) {
    const next = addEthiopianMonths({ year, month, day: 1 }, delta);
    setViewMonth(next.year, next.month);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" onClick={() => shift(-1)} aria-label="Previous month">
        <ChevronLeft />
      </Button>
      <div className="min-w-0 flex-1 text-center">
        <p className="font-ethiopic text-xl font-medium leading-tight text-ink sm:text-2xl">
          {label.amharic}{" "}
          <span className="font-sans text-base text-muted">{label.year}</span>
        </p>
        <p className="text-xs text-muted">
          {label.latin} · {gregRange}
        </p>
      </div>
      <Button variant="outline" size="icon-sm" onClick={() => shift(1)} aria-label="Next month">
        <ChevronRight />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="hidden sm:inline-flex"
        onClick={() => setViewMonth(today.year, today.month)}
      >
        Today
      </Button>
    </div>
  );
}
