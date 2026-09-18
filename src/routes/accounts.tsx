import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountGlyph, ACCOUNT_TYPE_LABEL } from "@/components/account-icon";
import { Money } from "@/components/money";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardHint, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, NativeSelect } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountBalances, overallBalance, unassignedTransactions } from "@/lib/finance";
import { useFinanceStore } from "@/lib/store";
import type { Account, AccountType } from "@/lib/types";

export const Route = createFileRoute("/accounts")({ component: AccountsPage });

const ACCOUNT_TYPES: AccountType[] = ["cash", "bank", "mobile", "savings", "other"];

function AccountsPage() {
  const accounts = useFinanceStore((s) => s.accounts);
  const transactions = useFinanceStore((s) => s.transactions);
  const deleteAccount = useFinanceStore((s) => s.deleteAccount);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const rows = useMemo(() => accountBalances(transactions, accounts), [transactions, accounts]);
  const untracked = useMemo(() => unassignedTransactions(transactions, accounts), [transactions, accounts]);
  const untrackedBalance = untracked.reduce(
    (s, t) => s + (t.type === "income" ? t.amount : -t.amount),
    0,
  );
  const total = overallBalance(transactions);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(account: Account) {
    setEditing(account);
    setOpen(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Accounts</h1>
          <p className="mt-1 text-sm text-muted">Where your money actually sits</p>
        </div>
        <Button size="sm" onClick={openNew}>
          Add account
        </Button>
      </header>

      <Card className="bg-accent p-5 text-accent-fg">
        <p className="text-sm text-accent-fg/70">Total across accounts</p>
        <p className="mt-1 font-display text-3xl font-medium tabular">
          <Money amount={total} className="text-accent-fg" />
        </p>
      </Card>

      {rows.length === 0 ? (
        <Card>
          <p className="text-sm text-muted">No accounts yet. Add your bank, cash, or mobile wallet.</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map(({ account, balance }) => (
            <li key={account.id}>
              <Card className="flex items-center gap-3 p-4">
                <AccountGlyph type={account.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{account.name}</p>
                  <p className="text-xs text-muted">{ACCOUNT_TYPE_LABEL[account.type]}</p>
                </div>
                <Money
                  amount={balance}
                  signed
                  tone={balance < 0 ? "expense" : "ink"}
                  className="text-sm font-medium"
                />
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-bg-warm hover:text-ink"
                  onClick={() => openEdit(account)}
                  aria-label={`Edit ${account.name}`}
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-expense-soft hover:text-expense"
                  onClick={() => deleteAccount(account.id)}
                  aria-label={`Delete ${account.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {untracked.length > 0 ? (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Unassigned entries</p>
              <p className="text-xs text-muted">
                {untracked.length} transaction{untracked.length === 1 ? "" : "s"} without an account
              </p>
            </div>
            <Money
              amount={untrackedBalance}
              signed
              tone={untrackedBalance < 0 ? "expense" : "ink"}
              className="text-sm"
            />
          </div>
        </Card>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent title={editing ? "Edit account" : "New account"}>
          <AccountForm
            initial={editing ?? undefined}
            onDone={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountForm({ initial, onDone }: { initial?: Account; onDone: () => void }) {
  const addAccount = useFinanceStore((s) => s.addAccount);
  const updateAccount = useFinanceStore((s) => s.updateAccount);
  const deleteAccount = useFinanceStore((s) => s.deleteAccount);
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<AccountType>(initial?.type ?? "cash");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the account a name.");
      return;
    }
    if (initial) updateAccount(initial.id, { name: trimmed, type });
    else addAccount({ name: trimmed, type });
    onDone();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="acc-name">Name</Label>
        <Input
          id="acc-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="e.g. CBE, Telebirr, Cash on hand"
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="acc-type">Type</Label>
        <NativeSelect id="acc-type" value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          {ACCOUNT_TYPES.map((t) => (
            <option key={t} value={t}>
              {ACCOUNT_TYPE_LABEL[t]}
            </option>
          ))}
        </NativeSelect>
      </div>
      {error ? <p className="text-sm text-expense">{error}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="submit" className="flex-1">
          {initial ? "Save changes" : "Add account"}
        </Button>
        {initial ? (
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              deleteAccount(initial.id);
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
