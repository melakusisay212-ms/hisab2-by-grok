import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Landmark,
  Plus,
  Settings,
  Wallet,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/transaction-form";

import { ThemeEffect } from "@/components/theme-effect";
import { todayEthiopian, formatEthDate, toGregorian, formatGregorianShort } from "@/lib/ethiopian";
import { useFinanceStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", amharic: "መነሻ", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", amharic: "ቀን መቁጠሪያ", icon: CalendarDays },
  { to: "/transactions", label: "Ledger", amharic: "መዝገብ", icon: BookOpen },
  { to: "/budgets", label: "Budgets", amharic: "በጀት", icon: Wallet },
  { to: "/analysis", label: "Analysis", amharic: "ትንተና", icon: BarChart3 },
] as const;

const SECONDARY_NAV = [
  { to: "/accounts", label: "Accounts", amharic: "ሂሳቦች", icon: Landmark },
  { to: "/settings", label: "Settings", amharic: "ቅንብሮች", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const today = todayEthiopian();

  return (
    <div className="flex min-h-dvh bg-bg text-ink">
      <ThemeEffect />
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} {...item} active={pathname === item.to} />
          ))}
          <div className="my-2 h-px bg-line" />
          {SECONDARY_NAV.map((item) => (
            <NavLink key={item.to} {...item} active={pathname === item.to} />
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-accent-fg"
        >
          <Plus className="size-4" />
          New entry
        </button>
        <p className="mt-3 text-center text-[10px] text-faint">Developed by Melaku Sisay</p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Brand compact />
            <div className="flex items-center gap-3">
              <p className="truncate text-right text-xs text-muted">
                {formatEthDate(today, { script: "amharic" })}
              </p>
              <Link
                to="/settings"
                className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-bg-warm hover:text-ink"
                aria-label="Settings"
              >
                <Settings className="size-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 lg:max-w-none lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mb-6 hidden items-end justify-between lg:flex">
            <p className="text-sm text-muted">
              {formatEthDate(today, { weekday: true, script: "both" })}
              <span className="mx-2 text-line-strong">·</span>
              {formatGregorianShort(toGregorian(today))}
            </p>
            <GeezToggle />
          </div>
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-20 z-40 flex size-14 items-center justify-center rounded-full bg-accent text-accent-fg shadow-float lg:hidden"
        aria-label="Add transaction"
      >
        <Plus className="size-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="New entry">
          <TransactionForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-sm bg-accent text-accent-fg">
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <rect x="3" y="2.5" width="10" height="11" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </span>
      <span>
        <span className="block font-display text-lg leading-none font-medium tracking-tight">Hisab</span>
        {compact ? null : <span className="font-ethiopic text-xs text-muted">ሂሳብ</span>}
      </span>
    </Link>
  );
}

function NavLink({
  to,
  label,
  amharic,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  amharic: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-150",
        active ? "bg-accent-soft text-accent" : "text-ink-soft hover:bg-bg-warm",
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} />
      <span>
        <span className="block leading-tight">{label}</span>
        <span className="font-ethiopic text-xs text-muted">{amharic}</span>
      </span>
    </Link>
  );
}

function GeezToggle() {
  const geez = useFinanceStore((s) => s.geezNumerals);
  const setGeez = useFinanceStore((s) => s.setGeezNumerals);
  return (
    <button
      type="button"
      onClick={() => setGeez(!geez)}
      className="rounded-md px-3 py-1.5 text-xs font-medium text-muted shadow-border hover:bg-surface"
    >
      {geez ? "Arabic numerals" : "Geʽez numerals"}
    </button>
  );
}
