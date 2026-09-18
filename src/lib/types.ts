import type { EthDate } from "./ethiopian";

export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  categoryId: string;
  note: string;
  date: EthDate;
  createdAt: number;
  accountId?: string;
};

export type Budget = {
  id: string;
  year: number;
  month: number;
  categoryId: string | "overall";
  amount: number;
};

export type Category = {
  id: string;
  name: string;
  amharic: string;
  type: TxType;
  icon: string;
};

export type AccountType = "cash" | "bank" | "mobile" | "savings" | "other";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  note?: string;
  createdAt: number;
};

export type ThemeId =
  | "warm"
  | "dark"
  | "ocean"
  | "forest"
  | "sunset"
  | "midnight"
  | "contrast"
  | "pastel";
