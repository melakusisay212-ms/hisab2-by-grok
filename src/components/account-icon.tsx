import { Banknote, Landmark, PiggyBank, Smartphone, Wallet2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountType } from "@/lib/types";

const ICONS: Record<AccountType, LucideIcon> = {
  cash: Banknote,
  bank: Landmark,
  mobile: Smartphone,
  savings: PiggyBank,
  other: Wallet2,
};

export function AccountGlyph({ type, className }: { type: AccountType; className?: string }) {
  const Icon = ICONS[type] ?? Wallet2;
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  );
}

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  cash: "Cash",
  bank: "Bank account",
  mobile: "Mobile wallet",
  savings: "Savings",
  other: "Other",
};
