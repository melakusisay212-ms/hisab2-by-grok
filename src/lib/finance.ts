import type { EthDate } from "./ethiopian";
import { dateKey, isSameEthMonth } from "./ethiopian";
import type { Account, Budget, Transaction, TxType } from "./types";
import { categoryById } from "./categories";

export function inMonth(tx: Transaction, year: number, month: number): boolean {
  return tx.date.year === year && tx.date.month === month;
}

export function monthTransactions(transactions: Transaction[], year: number, month: number): Transaction[] {
  return transactions.filter((tx) => inMonth(tx, year, month));
}

export function dayTransactions(transactions: Transaction[], date: EthDate): Transaction[] {
  const key = dateKey(date);
  return transactions.filter((tx) => dateKey(tx.date) === key);
}

export function sumByType(transactions: Transaction[], type: TxType): number {
  return transactions.filter((tx) => tx.type === type).reduce((s, tx) => s + tx.amount, 0);
}

export function monthTotals(transactions: Transaction[], year: number, month: number) {
  const list = monthTransactions(transactions, year, month);
  const income = sumByType(list, "income");
  const expense = sumByType(list, "expense");
  return {
    income,
    expense,
    net: income - expense,
    count: list.length,
  };
}

export function dayTotals(transactions: Transaction[], date: EthDate) {
  const list = dayTransactions(transactions, date);
  return {
    income: sumByType(list, "income"),
    expense: sumByType(list, "expense"),
    net: sumByType(list, "income") - sumByType(list, "expense"),
    count: list.length,
  };
}

export function overallBalance(transactions: Transaction[]): number {
  return transactions.reduce((s, tx) => s + (tx.type === "income" ? tx.amount : -tx.amount), 0);
}

export function categoryBreakdown(transactions: Transaction[], type: TxType) {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== type) continue;
    map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
  }
  return [...map.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      category: categoryById(categoryId),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function overallBudget(budgets: Budget[], year: number, month: number): Budget | undefined {
  return budgets.find((b) => b.year === year && b.month === month && b.categoryId === "overall");
}

export function categoryBudgets(budgets: Budget[], year: number, month: number): Budget[] {
  return budgets.filter((b) => b.year === year && b.month === month && b.categoryId !== "overall");
}

export function sortTransactions(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date.year !== b.date.year) return b.date.year - a.date.year;
    if (a.date.month !== b.date.month) return b.date.month - a.date.month;
    if (a.date.day !== b.date.day) return b.date.day - a.date.day;
    return b.createdAt - a.createdAt;
  });
}

export function groupedByDay(transactions: Transaction[]): { key: string; date: EthDate; items: Transaction[] }[] {
  const groups = new Map<string, Transaction[]>();
  for (const tx of sortTransactions(transactions)) {
    const key = dateKey(tx.date);
    const list = groups.get(key);
    if (list) list.push(tx);
    else groups.set(key, [tx]);
  }
  return [...groups.entries()].map(([key, items]) => ({
    key,
    date: items[0]!.date,
    items,
  }));
}

export function sameMonth(a: Pick<EthDate, "year" | "month">, b: Pick<EthDate, "year" | "month">) {
  return isSameEthMonth(a, b);
}

export function accountBalance(transactions: Transaction[], accountId: string): number {
  return transactions
    .filter((tx) => tx.accountId === accountId)
    .reduce((s, tx) => s + (tx.type === "income" ? tx.amount : -tx.amount), 0);
}

export function accountBalances(
  transactions: Transaction[],
  accounts: Account[],
): { account: Account; balance: number }[] {
  return accounts.map((account) => ({
    account,
    balance: accountBalance(transactions, account.id),
  }));
}

export function unassignedTransactions(transactions: Transaction[], accounts: Account[]): Transaction[] {
  const ids = new Set(accounts.map((a) => a.id));
  return transactions.filter((tx) => !tx.accountId || !ids.has(tx.accountId));
}
