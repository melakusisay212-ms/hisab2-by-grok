import { formatEthDate, formatGregorianShort, toGregorian } from "./ethiopian";
import { categoryById } from "./categories";
import { sortTransactions } from "./finance";
import type { Account, Transaction } from "./types";

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function transactionsToCSV(transactions: Transaction[], accounts: Account[]): string {
  const accountName = (id?: string) => accounts.find((a) => a.id === id)?.name ?? "";
  const header = [
    "Ethiopian date",
    "Gregorian date",
    "Type",
    "Category",
    "Account",
    "Amount (birr)",
    "Note",
  ];
  const rows = sortTransactions(transactions).map((tx) => {
    const category = categoryById(tx.categoryId);
    return [
      formatEthDate(tx.date, { script: "latin" }),
      formatGregorianShort(toGregorian(tx.date)),
      tx.type,
      category?.name ?? tx.categoryId,
      accountName(tx.accountId),
      tx.amount.toFixed(2),
      tx.note,
    ];
  });
  return [header, ...rows].map((row) => row.map((cell) => csvCell(String(cell))).join(",")).join("\n");
}

/** Triggers a browser download of the given CSV content. Client-side only. */
export function downloadCSV(filename: string, content: string): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
