import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { MonthSwitcher } from "@/components/month-switcher";
import { TransactionRow } from "@/components/transaction-row";
import { TransactionForm } from "@/components/transaction-form";
import { Money } from "@/components/money";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, NativeSelect } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { downloadCSV, transactionsToCSV } from "@/lib/csv";
import { dateKey, formatEthDate, formatGregorianShort, todayEthiopian, toGregorian } from "@/lib/ethiopian";
import { groupedByDay, monthTotals, monthTransactions } from "@/lib/finance";
import { useFinanceStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/categories";
import type { Transaction, TxType } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transactions")({ component: TransactionsPage });

function TransactionsPage() {
  const year = useFinanceStore((s) => s.viewYear);
  const month = useFinanceStore((s) => s.viewMonth);
  const all = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TxType | "all">("all");
  const [categoryId, setCategoryId] = useState("all");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [scope, setScope] = useState<"month" | "all">("month");

  const source = scope === "month" ? monthTransactions(all, year, month) : all;
  const totals = monthTotals(scope === "month" ? all : source, year, month);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return source.filter((tx) => {
      if (type !== "all" && tx.type !== type) return false;
      if (categoryId !== "all" && tx.categoryId !== categoryId) return false;
      if (!q) return true;
      const cat = CATEGORIES.find((c) => c.id === tx.categoryId);
      return (
        tx.note.toLowerCase().includes(q) ||
        (cat?.name.toLowerCase().includes(q) ?? false) ||
        (cat?.amharic.includes(q) ?? false)
      );
    });
  }, [source, type, categoryId, query]);

  const groups = groupedByDay(filtered);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Ledger</h1>
          <p className="mt-1 text-sm text-muted">Income and expenses, grouped by Ethiopian date</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            downloadCSV(
              `hisab-ledger-${dateKey(todayEthiopian())}.csv`,
              transactionsToCSV(filtered, accounts),
            )
          }
        >
          <Download className="size-4" />
          Export
        </Button>
      </header>

      <MonthSwitcher />

      <div className="flex gap-4 text-sm">
        <span>
          In <Money amount={scope === "month" ? totals.income : filtered.filter(t => t.type === "income").reduce((s,t)=>s+t.amount,0)} tone="income" className="text-sm" />
        </span>
        <span>
          Out <Money amount={scope === "month" ? totals.expense : filtered.filter(t => t.type === "expense").reduce((s,t)=>s+t.amount,0)} tone="expense" className="text-sm" />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes or categories"
          aria-label="Search"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NativeSelect value={scope} onChange={(e) => setScope(e.target.value as "month" | "all")}>
            <option value="month">This month</option>
            <option value="all">All months</option>
          </NativeSelect>
          <NativeSelect value={type} onChange={(e) => setType(e.target.value as TxType | "all")}>
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </NativeSelect>
          <NativeSelect
            className="col-span-2 sm:col-span-2"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No entries match these filters.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => {
            const income = group.items.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
            const expense = group.items.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
            return (
              <section key={group.key}>
                <div className="mb-1 flex items-end justify-between gap-2">
                  <div>
                    <h2 className="font-ethiopic text-base font-medium text-ink">
                      {formatEthDate(group.date, { weekday: true, script: "amharic" })}
                    </h2>
                    <p className="text-xs text-muted">{formatGregorianShort(toGregorian(group.date))}</p>
                  </div>
                  <p className={cn("text-xs tabular", income - expense >= 0 ? "text-income" : "text-expense")}>
                    {income > 0 ? `+${Math.round(income)} ` : ""}
                    {expense > 0 ? `−${Math.round(expense)}` : ""}
                  </p>
                </div>
                <Card className="p-2 sm:p-3">
                  {group.items.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} onClick={() => setEditing(tx)} />
                  ))}
                </Card>
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent title="Edit entry">
          {editing ? <TransactionForm initial={editing} onDone={() => setEditing(null)} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
