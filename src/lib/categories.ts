import type { Category, TxType } from "./types";

export const CATEGORIES: Category[] = [
  { id: "salary", name: "Salary", amharic: "ደመወዝ", type: "income", icon: "wallet" },
  { id: "business", name: "Business", amharic: "ንግድ", type: "income", icon: "store" },
  { id: "freelance", name: "Freelance", amharic: "ፍሪላንስ", type: "income", icon: "briefcase" },
  { id: "gift-in", name: "Gift", amharic: "ስጦታ", type: "income", icon: "gift" },
  { id: "other-in", name: "Other income", amharic: "ሌላ ገቢ", type: "income", icon: "plus-circle" },

  { id: "food", name: "Food", amharic: "ምግብ", type: "expense", icon: "utensils" },
  { id: "coffee", name: "Coffee & café", amharic: "ቡና", type: "expense", icon: "coffee" },
  { id: "transport", name: "Transport", amharic: "ትራንስፖርት", type: "expense", icon: "bus" },
  { id: "housing", name: "Housing & rent", amharic: "ኪራይ", type: "expense", icon: "home" },
  { id: "utilities", name: "Utilities", amharic: "መገልገያ", type: "expense", icon: "zap" },
  { id: "mobile", name: "Mobile & data", amharic: "ሞባይል", type: "expense", icon: "smartphone" },
  { id: "health", name: "Health", amharic: "ጤና", type: "expense", icon: "heart-pulse" },
  { id: "education", name: "Education", amharic: "ትምህርት", type: "expense", icon: "graduation-cap" },
  { id: "clothing", name: "Clothing", amharic: "ልብስ", type: "expense", icon: "shirt" },
  { id: "family", name: "Family", amharic: "ቤተሰብ", type: "expense", icon: "users" },
  { id: "tithe", name: "Giving", amharic: "ምጽዋት", type: "expense", icon: "hand-heart" },
  { id: "other-out", name: "Other", amharic: "ሌላ", type: "expense", icon: "ellipsis" },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  string,
  Category
>;

export function categoriesFor(type: TxType): Category[] {
  return CATEGORIES.filter((c) => c.type === type);
}

export function categoryById(id: string): Category | undefined {
  return CATEGORY_MAP[id];
}
