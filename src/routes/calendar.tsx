import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarMonth } from "@/components/calendar-month";
import { MonthSwitcher } from "@/components/month-switcher";
import { TransactionRow } from "@/components/transaction-row";
import { TransactionForm } from "@/components/transaction-form";
import { Money } from "@/components/money";
import { Card, CardHeader, CardTitle, CardHint } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  formatEthDate,
  formatGregorianShort,
  holidaysForMonth,
  isSameEthDay,
  toGeezNumeral,
  toGregorian,
  todayEthiopian,
} from "@/lib/ethiopian";
import { dayTransactions, dayTotals, monthTotals } from "@/lib/finance";
import { useFinanceStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

function CalendarPage() {
  const year = useFinanceStore((s) => s.viewYear);
  const month = useFinanceStore((s) => s.viewMonth);
  const geez = useFinanceStore((s) => s.geezNumerals);
  const setGeez = useFinanceStore((s) => s.setGeezNumerals);
  const transactions = useFinanceStore((s) => s.transactions);
  const today = todayEthiopian();
  const selected = useFinanceStore((s) => s.selectedDay);
  const setSelectedDay = useFinanceStore((s) => s.setSelectedDay);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [adding, setAdding] = useState(false);

  const viewSelected = selected.year === year && selected.month === month ? selected : null;
  const dayTx = useMemo(
    () => (viewSelected ? dayTransactions(transactions, viewSelected) : []),
    [transactions, viewSelected],
  );
  const totals = useMemo(
    () => (viewSelected ? dayTotals(transactions, viewSelected) : { income: 0, expense: 0, net: 0, count: 0 }),
    [transactions, viewSelected],
  );
  const monthSum = useMemo(() => monthTotals(transactions, year, month), [transactions, year, month]);
  const holiday = viewSelected ? holidaysForMonth(year, month).get(viewSelected.day) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted">Thirteen months · tap a day for its ledger</p>
        </div>
        <button
          type="button"
          onClick={() => setGeez(!geez)}
          className="rounded-md px-3 py-2 text-xs font-medium text-muted shadow-border lg:hidden"
        >
          {geez ? "123" : "፩፪፫"}
        </button>
      </header>

      <MonthSwitcher />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <CardHint>Month income</CardHint>
          <Money amount={monthSum.income} tone="income" className="text-lg font-medium" />
        </Card>
        <Card className="p-4">
          <CardHint>Month expenses</CardHint>
          <Money amount={monthSum.expense} tone="expense" className="text-lg font-medium" />
        </Card>
        <Card className="p-4">
          <CardHint>Net</CardHint>
          <Money amount={monthSum.net} signed className="text-lg font-medium" />
        </Card>
      </div>

      <Card className="p-3 sm:p-5">
        <CalendarMonth
          year={year}
          month={month}
          selected={viewSelected}
          onSelect={setSelectedDay}
        />
      </Card>

      {viewSelected ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="font-ethiopic">
                {geez ? toGeezNumeral(viewSelected.day) : viewSelected.day}{" "}
                {formatEthDate(viewSelected, { script: "amharic" })}
              </CardTitle>
              <CardHint>
                {formatGregorianShort(toGregorian(viewSelected))}
                {isSameEthDay(viewSelected, today) ? " · Today" : ""}
                {holiday ? ` · ${holiday.en} · ${holiday.am}` : ""}
              </CardHint>
            </div>
            <Button size="sm" onClick={() => setAdding(true)}>
              Add
            </Button>
          </CardHeader>
          <div className="mb-3 flex gap-4 text-sm">
            <span>
              In <Money amount={totals.income} tone="income" className="text-sm" />
            </span>
            <span>
              Out <Money amount={totals.expense} tone="expense" className="text-sm" />
            </span>
          </div>
          {dayTx.length === 0 ? (
            <p className="text-sm text-muted">Nothing recorded on this day.</p>
          ) : (
            <ul>
              {dayTx.map((tx) => (
                <li key={tx.id}>
                  <TransactionRow tx={tx} onClick={() => setEditing(tx)} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : (
        <p className="text-sm text-muted">Select a day in {formatEthDate({ year, month, day: 1 }, { script: "latin" }).split(",")[0]}.</p>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent title="New entry">
          {viewSelected ? (
            <TransactionForm defaultDate={viewSelected} onDone={() => setAdding(false)} />
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Edit entry">
          {editing ? <TransactionForm initial={editing} onDone={() => setEditing(null)} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
