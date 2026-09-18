import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthSwitcher } from "@/components/month-switcher";
import { Money } from "@/components/money";
import { Card, CardHeader, CardTitle, CardHint } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  addEthiopianMonths,
  daysInEthiopianMonth,
  monthLabel,
  toGeezNumeral,
} from "@/lib/ethiopian";
import {
  categoryBreakdown,
  monthTotals,
  monthTransactions,
  overallBudget,
} from "@/lib/finance";
import { formatPercent } from "@/lib/format";
import { useFinanceStore } from "@/lib/store";

export const Route = createFileRoute("/analysis")({ component: AnalysisPage });

const INCOME = "var(--color-income)";
const EXPENSE = "var(--color-expense)";
const INCOME_SOFT = "var(--color-income-soft)";
const EXPENSE_SOFT = "var(--color-expense-soft)";

export function AnalysisPage() {
  const year = useFinanceStore((s) => s.viewYear);
  const month = useFinanceStore((s) => s.viewMonth);
  const geez = useFinanceStore((s) => s.geezNumerals);
  const transactions = useFinanceStore((s) => s.transactions);
  const budgets = useFinanceStore((s) => s.budgets);

  const label = monthLabel(year, month, geez);
  const prev = addEthiopianMonths({ year, month, day: 1 }, -1);
  const totals = useMemo(() => monthTotals(transactions, year, month), [transactions, year, month]);
  const prevTotals = useMemo(
    () => monthTotals(transactions, prev.year, prev.month),
    [transactions, prev.year, prev.month],
  );
  const monthTx = useMemo(() => monthTransactions(transactions, year, month), [transactions, year, month]);
  const expenseCats = useMemo(() => categoryBreakdown(monthTx, "expense"), [monthTx]);
  const incomeCats = useMemo(() => categoryBreakdown(monthTx, "income"), [monthTx]);
  const budget = overallBudget(budgets, year, month);
  const savings = totals.income > 0 ? totals.net / totals.income : 0;

  const dim = daysInEthiopianMonth(year, month);
  const daily = useMemo(() => {
    return Array.from({ length: dim }, (_, i) => {
      const day = i + 1;
      const list = monthTx.filter((t) => t.date.day === day);
      const income = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = list.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return {
        day,
        label: geez ? toGeezNumeral(day) : String(day),
        income,
        expense,
      };
    });
  }, [monthTx, dim, geez]);

  const compare = [
    { name: monthLabel(prev.year, prev.month).latin, income: prevTotals.income, expense: prevTotals.expense },
    { name: label.latin, income: totals.income, expense: totals.expense },
  ];

  const expenseDelta = prevTotals.expense === 0 ? null : (totals.expense - prevTotals.expense) / prevTotals.expense;
  const incomeDelta = prevTotals.income === 0 ? null : (totals.income - prevTotals.income) / prevTotals.income;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Analysis</h1>
        <p className="mt-1 font-ethiopic text-sm text-muted">የ{label.amharic} ትንተና</p>
      </header>

      <MonthSwitcher />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Savings rate"
          value={totals.income === 0 ? "—" : formatPercent(savings)}
          hint={totals.net >= 0 ? "Income kept" : "Spending exceeded income"}
        />
        <Stat
          label="Expense vs last month"
          value={expenseDelta === null ? "—" : formatPercent(expenseDelta)}
          hint={monthLabel(prev.year, prev.month).latin}
        />
        <Stat
          label="Income vs last month"
          value={incomeDelta === null ? "—" : formatPercent(incomeDelta)}
          hint={
            budget
              ? `${formatPercent(totals.expense / budget.amount)} of budget`
              : "No overall budget set"
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily flow</CardTitle>
          <CardHint>Income and expenses across {label.amharic}</CardHint>
        </CardHeader>
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="income" stroke={INCOME} fill={INCOME_SOFT} strokeWidth={1.6} />
              <Area type="monotone" dataKey="expense" stroke={EXPENSE} fill={EXPENSE_SOFT} strokeWidth={1.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Month versus previous</CardTitle>
          <CardHint>
            {monthLabel(prev.year, prev.month).amharic} → {label.amharic}
          </CardHint>
        </CardHeader>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compare} barGap={8}>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="income" fill={INCOME} radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill={EXPENSE} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where birr went</CardTitle>
          <CardHint>Expense categories this month</CardHint>
        </CardHeader>
        {expenseCats.length === 0 ? (
          <p className="text-sm text-muted">No expenses in this month.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {expenseCats.map((row) => {
              const share = totals.expense > 0 ? row.amount / totals.expense : 0;
              return (
                <li key={row.categoryId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>
                      {row.category?.name}
                      <span className="ml-2 font-ethiopic text-xs text-muted">{row.category?.amharic}</span>
                    </span>
                    <span className="tabular text-muted">
                      {formatPercent(share)} · <Money amount={row.amount} tone="muted" className="text-sm" />
                    </span>
                  </div>
                  <Progress value={share * 100} tone="expense" />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {incomeCats.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Income sources</CardTitle>
          </CardHeader>
          <ul className="flex flex-col gap-2">
            {incomeCats.map((row) => (
              <li key={row.categoryId} className="flex items-center justify-between text-sm">
                <span>
                  {row.category?.name}
                  <span className="ml-2 font-ethiopic text-xs text-muted">{row.category?.amharic}</span>
                </span>
                <Money amount={row.amount} tone="income" className="text-sm" />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-medium tabular">{value}</p>
      <p className="mt-1 text-xs text-faint">{hint}</p>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-surface px-3 py-2 text-xs shadow-float">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="tabular text-muted">
          {p.name}: <Money amount={Number(p.value) || 0} className="text-xs" />
        </p>
      ))}
    </div>
  );
}
