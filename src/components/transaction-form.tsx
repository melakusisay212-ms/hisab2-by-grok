import { useState } from "react";
import { EthiopianDateFields } from "@/components/ethiopian-date-fields";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoriesFor, categoryById } from "@/lib/categories";
import { todayEthiopian, type EthDate } from "@/lib/ethiopian";
import { parseAmount } from "@/lib/format";
import { useFinanceStore } from "@/lib/store";
import type { Transaction, TxType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TransactionForm({
  initial,
  defaultDate,
  defaultType,
  onDone,
}: {
  initial?: Transaction;
  defaultDate?: EthDate;
  defaultType?: TxType;
  onDone: () => void;
}) {
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const accounts = useFinanceStore((s) => s.accounts);
  const [type, setType] = useState<TxType>(initial?.type ?? defaultType ?? "expense");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categoriesFor(initial?.type ?? defaultType ?? "expense")[0]!.id,
  );
  const [accountId, setAccountId] = useState(initial?.accountId ?? accounts[0]?.id ?? "");
  const [date, setDate] = useState<EthDate>(initial?.date ?? defaultDate ?? todayEthiopian());
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  const cats = categoriesFor(type);

  function switchType(next: TxType) {
    setType(next);
    const nextCats = categoriesFor(next);
    if (!nextCats.some((c) => c.id === categoryId)) {
      setCategoryId(nextCats[0]!.id);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseAmount(amount);
    if (parsed === null || parsed <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!categoryById(categoryId)) {
      setError("Choose a category.");
      return;
    }
    const draft = {
      type,
      amount: parsed,
      categoryId,
      note: note.trim(),
      date,
      accountId: accountId || undefined,
    };
    if (initial) updateTransaction(initial.id, draft);
    else addTransaction(draft);
    onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg-warm p-1">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchType(t)}
            className={cn(
              "h-10 rounded-md text-sm font-medium capitalize transition-colors duration-150",
              type === t
                ? t === "income"
                  ? "bg-income text-accent-fg"
                  : "bg-expense text-accent-fg"
                : "text-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <Label htmlFor="amount">Amount (birr)</Label>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          autoFocus
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <NativeSelect
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.amharic} · {c.name}
            </option>
          ))}
        </NativeSelect>
      </div>

      {accounts.length > 0 ? (
        <div>
          <Label htmlFor="account">Account</Label>
          <NativeSelect id="account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}

      <EthiopianDateFields value={date} onChange={setDate} />

      <div>
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Optional — e.g. Merkato groceries"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>

      {error ? <p className="text-sm text-expense">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="submit" variant={type === "income" ? "income" : "expense"} className="flex-1">
          {initial ? "Save changes" : type === "income" ? "Add income" : "Add expense"}
        </Button>
        {initial ? (
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              deleteTransaction(initial.id);
              onDone();
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
