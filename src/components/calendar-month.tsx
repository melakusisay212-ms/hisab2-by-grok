import {
  WEEKDAYS,
  isSameEthDay,
  monthGrid,
  toGeezNumeral,
  todayEthiopian,
  type EthDate,
} from "@/lib/ethiopian";
import { dayTotals } from "@/lib/finance";
import { useFinanceStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CalendarMonth({
  year,
  month,
  selected,
  onSelect,
}: {
  year: number;
  month: number;
  selected: EthDate | null;
  onSelect: (date: EthDate) => void;
}) {
  const transactions = useFinanceStore((s) => s.transactions);
  const geez = useFinanceStore((s) => s.geezNumerals);
  const today = todayEthiopian();
  const cells = monthGrid(year, month);

  return (
    <div>
      <div className="mb-2 grid grid-cols-7">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd.index}
            className="py-2 text-center font-ethiopic text-xs font-medium text-muted"
          >
            <span className="hidden sm:inline">{wd.amharic}</span>
            <span className="sm:hidden">{wd.short}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.inMonth) {
            return <div key={`empty-${i}`} className="min-h-14 sm:min-h-20" />;
          }
          const totals = dayTotals(transactions, cell.date);
          const isToday = isSameEthDay(cell.date, today);
          const isSelected = selected ? isSameEthDay(cell.date, selected) : false;
          return (
            <DayCell
              key={cell.date.day}
              date={cell.date}
              holiday={cell.holiday}
              geez={geez}
              totals={totals}
              isToday={isToday}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayCell({
  date,
  holiday,
  geez,
  totals,
  isToday,
  isSelected,
  onSelect,
}: {
  date: EthDate;
  holiday?: string;
  geez: boolean;
  totals: { income: number; expense: number; count: number };
  isToday: boolean;
  isSelected: boolean;
  onSelect: (date: EthDate) => void;
}) {
  const hasActivity = totals.count > 0;
  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={cn(
        "flex min-h-14 flex-col items-stretch rounded-md px-1 py-1.5 text-left transition-colors duration-150 sm:min-h-20 sm:px-2",
        isSelected ? "bg-accent text-accent-fg" : "hover:bg-bg-warm",
        isToday && !isSelected && "shadow-border",
      )}
    >
      <span className="flex items-center justify-between">
        <span
          className={cn(
            "font-ethiopic text-sm leading-none sm:text-base",
            isSelected ? "text-accent-fg" : "text-ink",
          )}
        >
          {geez ? toGeezNumeral(date.day) : date.day}
        </span>
        {holiday ? (
          <span
            className={cn(
              "size-1.5 rounded-full",
              isSelected ? "bg-accent-fg" : "bg-warn",
            )}
            title={holiday}
          />
        ) : null}
      </span>
      {hasActivity ? (
        <span className="mt-auto hidden pt-1 sm:block">
          {totals.income > 0 ? (
            <span className={cn("block truncate text-xs tabular", isSelected ? "text-accent-fg/90" : "text-income")}>
              +{Math.round(totals.income)}
            </span>
          ) : null}
          {totals.expense > 0 ? (
            <span className={cn("block truncate text-xs tabular", isSelected ? "text-accent-fg/80" : "text-expense")}>
              −{Math.round(totals.expense)}
            </span>
          ) : null}
        </span>
      ) : null}
      {hasActivity ? (
        <span className="mt-auto flex gap-0.5 pt-1 sm:hidden">
          {totals.income > 0 ? <span className={cn("h-1 flex-1 rounded-full", isSelected ? "bg-accent-fg" : "bg-income")} /> : null}
          {totals.expense > 0 ? <span className={cn("h-1 flex-1 rounded-full", isSelected ? "bg-accent-fg/70" : "bg-expense")} /> : null}
        </span>
      ) : null}
    </button>
  );
}

