import {
  Briefcase,
  Bus,
  Coffee,
  Ellipsis,
  Gift,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Home,
  PlusCircle,
  Shirt,
  Smartphone,
  Store,
  Utensils,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryById } from "@/lib/categories";

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet,
  store: Store,
  briefcase: Briefcase,
  gift: Gift,
  "plus-circle": PlusCircle,
  utensils: Utensils,
  coffee: Coffee,
  bus: Bus,
  home: Home,
  zap: Zap,
  smartphone: Smartphone,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  shirt: Shirt,
  users: Users,
  "hand-heart": HeartHandshake,
  ellipsis: Ellipsis,
};

export function CategoryGlyph({
  categoryId,
  className,
}: {
  categoryId: string;
  className?: string;
}) {
  const category = categoryById(categoryId);
  const Icon = ICONS[category?.icon ?? "ellipsis"] ?? Ellipsis;
  const tone = category?.type === "income" ? "bg-income-soft text-income" : "bg-expense-soft text-expense";
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md",
        tone,
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  );
}
