import { CategoryGlyph } from "@/components/category-icon";
import { Money } from "@/components/money";
import { categoryById } from "@/lib/categories";
import type { Transaction } from "@/lib/types";

export function TransactionRow({
  tx,
  onClick,
}: {
  tx: Transaction;
  onClick?: () => void;
}) {
  const category = categoryById(tx.categoryId);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left transition-colors duration-150 hover:bg-bg-warm"
    >
      <CategoryGlyph categoryId={tx.categoryId} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">
          {category?.name ?? "Other"}
        </span>
        <span className="block truncate text-xs text-muted">
          {tx.note || category?.amharic || "—"}
        </span>
      </span>
      <Money
        amount={tx.type === "income" ? tx.amount : -tx.amount}
        signed
        compact
        className="text-sm font-medium"
      />
    </button>
  );
}
