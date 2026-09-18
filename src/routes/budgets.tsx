import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MonthSwitcher } from "@/components/month-switcher";
import { CategoryGlyph } from "@/components/category-icon";
import { Money } from "@/components/money";
import { Card, CardHeader, CardTitle, CardHint } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/input";
import { CATEGORIES, categoriesFor } from "@/lib/categories";
import { parseAmount, formatPercent } from "@/lib/format";
import { categoryBudgets, monthTransactions, overallBudget, sumByType } from "@/lib/finance";
import { useFinanceStore } from "@/lib/store";
import { monthLabel } from "@/lib/ethiopian";

export const Route = createFileRoute("/budgets")({ component: BudgetsPage });

function BudgetsPage() {
  const year = useFinanceStore((s) => s.viewYear);
  const month = useFinanceStore((s) => s.viewMonth);
  const budgets = useFinanceStore((s) => s.budgets);
  const transactions = useFinanceStore((s) => s.transactions);
  const upsertBudget = useFinanceStore((s) => s.upsertBudget);
  const deleteBudget = useFinanceStore((s) => s.deleteBudget);
  const [open, setOpen] = useState(false);
  const [overallDraft, setOverallDraft] = useState("");

  const label = monthLabel(year, month);
  const monthTx = useMemo(() => monthTransactions(transactions, year, month), [transactions, year, month]);
  const spent = sumByType(monthTx, "expense");
  const overall = overallBudget(budgets, year, month);
  const cats = categoryBudgets(budgets, year, month);
  const spentRatio = overall && overall.amount > 0 ? spent / overall.amount : 0;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Budgets</h1>
        <p className="mt-1 font-ethiopic text-sm text-muted">የ{label.amharic} በጀት</p>
      </header>

      <MonthSwitcher />

      <Card className="bg-accent p-5 text-accent-fg">
        <p className="text-sm text-accent-fg/70">Overall envelope</p>
        <p className="mt-1 font-display text-3xl font-medium tabular">
          {overall ? <Money amount={overall.amount} className="text-accent-fg" /> : "Not set"}
        </p>
        {overall ? (
          <>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-accent-fg/20">
              <div
                className="h-full rounded-full bg-accent-fg"
                style={{ width: `${Math.min(spentRatio * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-accent-fg/80">
              <Money amount={spent} className="text-accent-fg" /> spent ·{" "}
              <Money amount={overall.amount - spent} className="text-accent-fg" /> left
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-accent-fg/70">Set a monthly ceiling for {label.latin}.</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Set overall budget</CardTitle>
            <CardHint>Birr for the whole Ethiopian month</CardHint>
          </div>
        </CardHeader>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const n = parseAmount(overallDraft || String(overall?.amount ?? ""));
            if (n && n > 0) {
              upsertBudget(year, month, "overall", n);
              setOverallDraft("");
            }
          }}
        >
          <Input
            inputMode="decimal"
            placeholder={overall ? String(overall.amount) : "16000"}
            value={overallDraft}
            onChange={(e) => setOverallDraft(e.target.value)}
          />
          <Button type="submit">Save</Button>
        </form>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-medium">Categories</h2>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          Add category
        </Button>
      </div>

      {cats.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No category envelopes yet. Add food, transport, coffee…</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {cats.map((b) => {
            const used = monthTx
              .filter((t) => t.type === "expense" && t.categoryId === b.categoryId)
              .reduce((s, t) => s + t.amount, 0);
            const ratio = b.amount > 0 ? used / b.amount : 0;
            const cat = CATEGORIES.find((c) => c.id === b.categoryId);
            return (
              <li key={b.id}>
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <CategoryGlyph categoryId={b.categoryId} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{cat?.name ?? b.categoryId}</p>
                          <p className="font-ethiopic text-xs text-muted">{cat?.amharic}</p>
                        </div>
                        <Badge tone={ratio > 1 ? "expense" : ratio > 0.85 ? "warn" : "accent"}>
                          {formatPercent(ratio)}
                        </Badge>
                      </div>
                      <Progress
                        className="mt-2"
                        value={Math.min(ratio * 100, 100)}
                        tone={ratio > 1 ? "expense" : "accent"}
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-muted">
                        <Money amount={used} tone="muted" className="text-xs" />
                        <Money amount={b.amount} tone="muted" className="text-xs" />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-muted hover:text-expense"
                      onClick={() => deleteBudget(b.id)}
                    >
                      Remove
                    </button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Category budget">
          <CategoryBudgetForm
            year={year}
            month={month}
            onSave={(categoryId, amount) => {
              upsertBudget(year, month, categoryId, amount);
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryBudgetForm({
  year,
  month,
  onSave,
}: {
  year: number;
  month: number;
  onSave: (categoryId: string, amount: number) => void;
}) {
  const existing = useFinanceStore((s) => s.budgets);
  const taken = new Set(
    existing.filter((b) => b.year === year && b.month === month).map((b) => b.categoryId),
  );
  const available = categoriesFor("expense").filter((c) => !taken.has(c.id));
  const [categoryId, setCategoryId] = useState(available[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (available.length === 0) {
    return <p className="text-sm text-muted">Every expense category already has an envelope this month.</p>;
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseAmount(amount);
        if (!n || n <= 0) {
          setError("Enter a budget greater than zero.");
          return;
        }
        onSave(categoryId, n);
      }}
    >
      <div>
        <Label>Category</Label>
        <NativeSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {c.amharic} · {c.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div>
        <Label>Amount (birr)</Label>
        <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="4500" />
      </div>
      {error ? <p className="text-sm text-expense">{error}</p> : null}
      <Button type="submit">Save envelope</Button>
    </form>
  );
}
