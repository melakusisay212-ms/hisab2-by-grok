import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { todayEthiopian, type EthDate } from "./ethiopian";
import { createSeed } from "./seed";
import type { Account, AccountType, Budget, ThemeId, Transaction } from "./types";
import { uid } from "./utils";

type Draft = Omit<Transaction, "id" | "createdAt">;
type AccountDraft = Omit<Account, "id" | "createdAt">;

type FinanceState = {
  hydrated: boolean;
  seeded: boolean;
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  theme: ThemeId;
  geezNumerals: boolean;
  viewYear: number;
  viewMonth: number;
  selectedDay: EthDate;
  setHydrated: () => void;
  setGeezNumerals: (value: boolean) => void;
  setTheme: (theme: ThemeId) => void;
  setViewMonth: (year: number, month: number) => void;
  setSelectedDay: (date: EthDate) => void;
  addTransaction: (draft: Draft) => void;
  updateTransaction: (id: string, draft: Draft) => void;
  deleteTransaction: (id: string) => void;
  upsertBudget: (year: number, month: number, categoryId: string, amount: number) => void;
  deleteBudget: (id: string) => void;
  addAccount: (draft: AccountDraft) => void;
  updateAccount: (id: string, draft: Partial<AccountDraft>) => void;
  deleteAccount: (id: string) => void;
  resetDemo: () => void;
};

function defaultAccounts(): Account[] {
  const now = Date.now();
  return [
    { id: "cash", name: "Cash", type: "cash" as AccountType, createdAt: now },
    { id: "bank", name: "Bank", type: "bank" as AccountType, createdAt: now + 1 },
  ];
}

function seedState() {
  const today = todayEthiopian();
  const seed = createSeed(today);
  return {
    transactions: seed.transactions,
    budgets: seed.budgets,
    accounts: defaultAccounts(),
    viewYear: today.year,
    viewMonth: today.month,
    selectedDay: today,
    seeded: true,
  };
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      seeded: false,
      transactions: [],
      budgets: [],
      accounts: [],
      theme: "warm",
      geezNumerals: false,
      viewYear: 2019,
      viewMonth: 1,
      selectedDay: { year: 2019, month: 1, day: 1 },
      setHydrated: () => {
        if (get().hydrated) return;
        if (!get().seeded && get().transactions.length === 0) {
          set({ ...seedState(), hydrated: true });
          return;
        }
        const needsAccounts = get().accounts.length === 0;
        set({
          hydrated: true,
          seeded: true,
          ...(needsAccounts ? { accounts: defaultAccounts() } : {}),
        });
      },
      setGeezNumerals: (value) => set({ geezNumerals: value }),
      setTheme: (theme) => set({ theme }),
      setViewMonth: (year, month) => set({ viewYear: year, viewMonth: month }),
      setSelectedDay: (date) =>
        set({ selectedDay: date, viewYear: date.year, viewMonth: date.month }),
      addTransaction: (draft) =>
        set({
          transactions: [
            { ...draft, id: uid(), createdAt: Date.now() },
            ...get().transactions,
          ],
        }),
      updateTransaction: (id, draft) =>
        set({
          transactions: get().transactions.map((tx) =>
            tx.id === id ? { ...tx, ...draft } : tx,
          ),
        }),
      deleteTransaction: (id) =>
        set({
          transactions: get().transactions.filter((tx) => tx.id !== id),
        }),
      upsertBudget: (year, month, categoryId, amount) => {
        const existing = get().budgets.find(
          (b) => b.year === year && b.month === month && b.categoryId === categoryId,
        );
        if (existing) {
          set({
            budgets: get().budgets.map((b) =>
              b.id === existing.id ? { ...b, amount } : b,
            ),
          });
          return;
        }
        set({
          budgets: [
            ...get().budgets,
            { id: uid(), year, month, categoryId, amount },
          ],
        });
      },
      deleteBudget: (id) =>
        set({ budgets: get().budgets.filter((b) => b.id !== id) }),
      addAccount: (draft) =>
        set({
          accounts: [...get().accounts, { ...draft, id: uid(), createdAt: Date.now() }],
        }),
      updateAccount: (id, draft) =>
        set({
          accounts: get().accounts.map((a) => (a.id === id ? { ...a, ...draft } : a)),
        }),
      deleteAccount: (id) =>
        set({
          accounts: get().accounts.filter((a) => a.id !== id),
          transactions: get().transactions.map((t) =>
            t.accountId === id ? { ...t, accountId: undefined } : t,
          ),
        }),
      resetDemo: () => set(seedState()),
    }),
    {
      name: "hisab-finance-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        accounts: state.accounts,
        theme: state.theme,
        geezNumerals: state.geezNumerals,
        viewYear: state.viewYear,
        viewMonth: state.viewMonth,
        selectedDay: state.selectedDay,
        seeded: state.seeded,
      }),
    },
  ),
);

export function useViewMonth(): EthDate {
  const year = useFinanceStore((s) => s.viewYear);
  const month = useFinanceStore((s) => s.viewMonth);
  return { year, month, day: 1 };
}
