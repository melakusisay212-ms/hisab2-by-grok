import {
  addEthiopianMonths,
  daysInEthiopianMonth,
  type EthDate,
} from "./ethiopian";
import type { Budget, Transaction } from "./types";

function id(tag: string) {
  return `seed_${tag}`;
}

function tx(
  tag: string,
  type: Transaction["type"],
  amount: number,
  categoryId: string,
  date: EthDate,
  note: string,
  createdAt: number,
): Transaction {
  return { id: id(tag), type, amount, categoryId, date, note, createdAt, accountId: accountFor(type, categoryId) };
}

/** Reasonable default account for a seeded demo entry, so the Accounts page has real data. */
function accountFor(type: Transaction["type"], categoryId: string): string {
  if (type === "income") {
    return categoryId === "salary" || categoryId === "business" || categoryId === "freelance"
      ? "bank"
      : "cash";
  }
  return categoryId === "housing" || categoryId === "utilities" ? "bank" : "cash";
}

export function createSeed(today: EthDate): { transactions: Transaction[]; budgets: Budget[] } {
  const transactions: Transaction[] = [];
  const months: { year: number; month: number; lastDay: number }[] = [];

  for (let i = 2; i >= 0; i--) {
    const cursor = addEthiopianMonths(today, -i);
    const dim = daysInEthiopianMonth(cursor.year, cursor.month);
    const lastDay = i === 0 ? Math.min(today.day, dim) : dim;
    months.push({ year: cursor.year, month: cursor.month, lastDay });
  }

  let seq = 0;
  const push = (
    type: Transaction["type"],
    amount: number,
    categoryId: string,
    date: EthDate,
    note: string,
  ) => {
    seq += 1;
    transactions.push(
      tx(
        String(seq).padStart(3, "0"),
        type,
        amount,
        categoryId,
        date,
        note,
        Date.UTC(2026, 0, 1) + seq * 36_000,
      ),
    );
  };

  for (const m of months) {
    const { year, month, lastDay } = m;
    const d = (day: number): EthDate => ({ year, month, day: Math.min(day, lastDay) });

    if (lastDay >= 1) {
      push("income", 18500, "salary", d(1), "Monthly salary");
    }
    if (lastDay >= 1) {
      push("expense", 7500, "housing", d(1), "House rent");
    }
    if (lastDay >= 2) {
      push("expense", 1850, "food", d(2), "Merkato groceries");
      push("expense", 250, "mobile", d(2), "Ethio Telecom airtime");
    }
    if (lastDay >= 3) {
      push("expense", 80, "coffee", d(3), "Buna with friends");
      push("expense", 45, "transport", d(3), "Minibus to Bole");
    }
    if (lastDay >= 5) {
      push("expense", 420, "utilities", d(5), "Electric bill");
      push("expense", 60, "transport", d(5), "Taxi home");
    }
    if (lastDay >= 7) {
      push("expense", 320, "food", d(7), "Lunch at shiro house");
      push("income", 2500, "freelance", d(7), "Translation work");
    }
    if (lastDay >= 9) {
      push("expense", 1500, "tithe", d(9), "Monthly giving");
      push("expense", 70, "coffee", d(9), "Traditional coffee");
    }
    if (lastDay >= 12) {
      push("expense", 980, "food", d(12), "Weekly vegetables & injera");
      push("expense", 35, "transport", d(12), "Minibus");
    }
    if (lastDay >= 15) {
      push("expense", 600, "clothing", d(15), "Cotton shawl");
      push("income", 1200, "gift-in", d(15), "Family gift");
    }
    if (lastDay >= 18) {
      push("expense", 450, "health", d(18), "Clinic visit");
      push("expense", 90, "coffee", d(18), "Café macchiato");
    }
    if (lastDay >= 21) {
      push("expense", 200, "education", d(21), "Exercise books");
      push("expense", 55, "transport", d(21), "Minibus to Piassa");
    }
    if (lastDay >= 24) {
      push("expense", 1400, "food", d(24), "Family Saturday market");
      push("expense", 300, "family", d(24), "Support for parents");
    }
    if (lastDay >= 27) {
      push("expense", 180, "mobile", d(27), "Data bundle");
      push("income", 800, "business", d(27), "Small shop sales");
    }
    if (lastDay >= 29) {
      push("expense", 75, "coffee", d(29), "Evening coffee");
    }
  }

  const current = months[months.length - 1]!;
  const prev = months[months.length - 2] ?? current;

  const budgets: Budget[] = [
    { id: id("b_over_cur"), year: current.year, month: current.month, categoryId: "overall", amount: 16000 },
    { id: id("b_food_cur"), year: current.year, month: current.month, categoryId: "food", amount: 4500 },
    { id: id("b_trans_cur"), year: current.year, month: current.month, categoryId: "transport", amount: 800 },
    { id: id("b_coffee_cur"), year: current.year, month: current.month, categoryId: "coffee", amount: 600 },
    { id: id("b_mobile_cur"), year: current.year, month: current.month, categoryId: "mobile", amount: 500 },
    { id: id("b_give_cur"), year: current.year, month: current.month, categoryId: "tithe", amount: 1500 },
    { id: id("b_over_prev"), year: prev.year, month: prev.month, categoryId: "overall", amount: 16000 },
    { id: id("b_food_prev"), year: prev.year, month: prev.month, categoryId: "food", amount: 4500 },
  ];

  return { transactions, budgets };
}
