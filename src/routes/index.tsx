import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Card, CardHeader, CardHint, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Money } from "@/components/money";
import { TransactionRow } from "@/components/transaction-row";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transaction-form";
import { MonthSwitcher } from "@/components/month-switcher";
import {
  WEEKDAYS,
  addEthiopianDays,
  dateKey,
  formatEthDate,
  isSameEthDay,
  monthLabel,
  todayEthiopian,
  weekdayOf,
} from "@/lib/ethiopian";
import {
  accountBalances,
  categoryBreakdown,
  monthTotals,
  overallBalance,
  overallBudget,
  sortTransactions,
  dayTotals,
} from "@/lib/finance";
import { useFinanceStore } from "@/lib/store";
import type { Transaction } from "@/lib/types";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const transactions = useFinanceStore((s) => s.transactions);
  const budgets = useFinanceStore((s) => s.budgets);
  const accounts = useFinanceStore((s) => s.accounts);
  const year = useFinanceStore((s) => s.viewYear);
  const month = useFinanceStore((s) => s.viewMonth);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const today = todayEthiopian();
  const setSelectedDay = useFinanceStore((s) => s.setSelectedDay);
  const label = monthLabel(year, month);
  const totals = useMemo(() => monthTotals(transactions, year, month), [transactions, year, month]);
  const balance = useMemo(() => overallBalance(transactions), [transactions]);
  const budget = overallBudget(budgets, year, month);
  const spentRatio = budget && budget.amount > 0 ? totals.expense / budget.amount : 0;
  const remaining = budget ? budget.amount - totals.expense : null;
  const recent = useMemo(() => sortTransactions(transactions).slice(0, 6), [transactions]);
  const topCats = useMemo(() => {
    const monthTx = transactions.filter((t) => t.date.year === year && t.date.month === month);
    return categoryBreakdown(monthTx, "expense").slice(0, 4);
  }, [transactions, year, month]);
  const accountRows = useMemo(() => accountBalances(transactions, accounts), [transactions, accounts]);
  const flowTotal = totals.income + totals.expense;
  const incomeShare = flowTotal > 0 ? (totals.income / flowTotal) * 100 : 50;

  const weekStart = addEthiopianDays(today, -weekdayOf(today));
  const week = Array.from({ length: 7 }, (_, i) => addEthiopianDays(weekStart, i));

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-sm text-muted">Welcome back</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Your ledger
        </h1>
        <p className="mt-1 font-ethiopic text-muted">የ{label.amharic} ሂሳብ</p>
      </header>

      <MonthSwitcher />

      <section className="grid gap-3 sm:grid-cols-2">
        <Card className="bg-accent p-5 text-accent-fg sm:col-span-2 sm:p-6">
          <p className="text-sm text-accent-fg/70">Running balance</p>
          <p className="mt-1 font-display text-4xl font-medium tracking-tight tabular sm:text-5xl">
            <Money amount={balance} className="text-accent-fg" />
          </p>
          <p className="mt-3 text-sm text-accent-fg/70">
            All recorded income minus expenses · kept on this device
          </p>
        </Card>
        <Card>
          <CardHint>Income · {label.latin}</CardHint>
          <p className="mt-1 font-display text-2xl font-medium">
            <Money amount={totals.income} tone="income" />
          </p>
        </Card>
        <Card>
          <CardHint>Expenses · {label.latin}</CardHint>
          <p className="mt-1 font-display text-2xl font-medium">
            <Money amount={totals.expense} tone="expense" />
          </p>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Cash flow</CardTitle>
            <CardHint>Income versus expenses · {label.latin}</CardHint>
          </div>
        </CardHeader>
        <div className="flex h-3 overflow-hidden rounded-full bg-bg-warm">
          <div className="h-full bg-income" style={{ width: `${incomeShare}%` }} />
          <div className="h-full bg-expense" style={{ width: `${100 - incomeShare}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full bg-income" />
            Income
          </span>
          <Money amount={totals.income} tone="income" className="text-sm font-medium" />
        </div>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted">
            <span className="size-2 rounded-full bg-expense" />
            Expenses
          </span>
          <Money amount={totals.expense} tone="expense" className="text-sm font-medium" />
        </div>
      </Card>

      {accountRows.length > 0 ? (
        <Card className="p-3 sm:p-4">
          <CardHeader className="mb-2 px-1">
            <CardTitle className="text-base">Accounts</CardTitle>
            <Link to="/accounts" className="flex items-center gap-1 text-sm text-accent">
              Manage <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <div className="flex gap-2 overflow-x-auto px-1 pb-1">
            {accountRows.map(({ account, balance: accBalance }) => (
              <Link
                key={account.id}
                to="/accounts"
                className="flex min-w-32 shrink-0 flex-col gap-1 rounded-lg bg-bg-warm px-3 py-2.5"
              >
                <span className="truncate text-xs text-muted">{account.name}</span>
                <Money
                  amount={accBalance}
                  signed
                  tone={accBalance < 0 ? "expense" : "ink"}
                  className="text-sm font-medium"
                />
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      {budget ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Monthly budget</CardTitle>
              <CardHint>
                {remaining !== null && remaining >= 0
                  ? `${formatPercent(1 - spentRatio)} remaining`
                  : "Over budget"}
              </CardHint>
            </div>
            <Badge tone={spentRatio > 1 ? "expense" : spentRatio > 0.85 ? "warn" : "accent"}>
              {formatPercent(Math.min(spentRatio, 9.99))} used
            </Badge>
          </CardHeader>
          <Progress
            value={Math.min(spentRatio * 100, 100)}
            tone={spentRatio > 1 ? "expense" : spentRatio > 0.85 ? "warn" : "accent"}
          />
          <div className="mt-3 flex justify-between text-sm">
            <Money amount={totals.expense} tone="muted" className="text-sm" />
            <Money amount={budget.amount} tone="muted" className="text-sm" />
          </div>
        </Card>
      ) : null}

      <Card className="p-3 sm:p-4">
        <CardHeader className="mb-1 px-1">
          <CardTitle className="text-base">This week</CardTitle>
          <CardHint>Ehud – Kidame</CardHint>
        </CardHeader>
        <div className="grid grid-cols-7 gap-1">
          {week.map((day) => {
            const totalsDay = dayTotals(transactions, day);
            const isToday = isSameEthDay(day, today);
            return (
              <Link
                key={dateKey(day)}
                to="/calendar"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex min-h-16 flex-col items-center rounded-md px-1 py-2",
                  isToday ? "bg-accent text-accent-fg" : "hover:bg-bg-warm",
                )}
              >
                <span className={cn("text-xs", isToday ? "text-accent-fg/80" : "text-muted")}>
                  {WEEKDAYS[weekdayOf(day)]?.latinShort}
                </span>
                <span className="font-ethiopic text-sm">{day.day}</span>
                {totalsDay.expense > 0 || totalsDay.income > 0 ? (
                  <span
                    className={cn(
                      "mt-1 size-1.5 rounded-full",
                      isToday ? "bg-accent-fg" : totalsDay.expense > totalsDay.income ? "bg-expense" : "bg-income",
                    )}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      </Card>

      {topCats.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Spending</CardTitle>
            <Link to="/analysis" className="flex items-center gap-1 text-sm text-accent">
              Analysis <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <ul className="flex flex-col gap-3">
            {topCats.map((row) => {
              const max = topCats[0]?.amount ?? 1;
              return (
                <li key={row.categoryId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>
                      {row.category?.name}
                      <span className="ml-2 font-ethiopic text-xs text-muted">{row.category?.amharic}</span>
                    </span>
                    <Money amount={row.amount} tone="muted" className="text-sm" />
                  </div>
                  <Progress value={(row.amount / max) * 100} tone="expense" />
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent</CardTitle>
          <Link to="/transactions" className="flex items-center gap-1 text-sm text-accent">
            Ledger <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">No entries yet. Add income or an expense to begin.</p>
        ) : (
          <ul>
            {recent.map((tx) => (
              <li key={tx.id}>
                <TransactionRow tx={tx} onClick={() => setEditing(tx)} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Edit entry">
          {editing ? (
            <div>
              <p className="mb-3 text-sm text-muted">{formatEthDate(editing.date)}</p>
              <TransactionForm initial={editing} onDone={() => setEditing(null)} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
