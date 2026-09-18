import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardHint, CardTitle } from "@/components/ui/card";
import { downloadCSV, transactionsToCSV } from "@/lib/csv";
import { dateKey, todayEthiopian } from "@/lib/ethiopian";
import { useFinanceStore } from "@/lib/store";
import type { ThemeId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const THEMES: { id: ThemeId; label: string; amharic: string; swatch: [string, string] }[] = [
  { id: "warm", label: "Warm", amharic: "ሙቅ", swatch: ["#f1ebe1", "#2c4a3e"] },
  { id: "dark", label: "Dark", amharic: "ጨለማ", swatch: ["#17181b", "#7cb79c"] },
  { id: "ocean", label: "Ocean", amharic: "ውቅያኖስ", swatch: ["#eef3f4", "#1f5c73"] },
  { id: "forest", label: "Forest", amharic: "ደን", swatch: ["#e8f0e9", "#2d5a3d"] },
  { id: "sunset", label: "Sunset", amharic: "ፀሐይ መጥለቂያ", swatch: ["#fdf1e6", "#c45c26"] },
  { id: "midnight", label: "Midnight", amharic: "እኩለ ሌሊት", swatch: ["#12101a", "#9b7ed9"] },
  { id: "contrast", label: "Contrast", amharic: "ንጽረት", swatch: ["#000000", "#ffffff"] },
  { id: "pastel", label: "Pastel", amharic: "ፓስቴል", swatch: ["#f8f0f5", "#d48bb0"] },
];

function SettingsPage() {
  const theme = useFinanceStore((s) => s.theme);
  const setTheme = useFinanceStore((s) => s.setTheme);
  const geez = useFinanceStore((s) => s.geezNumerals);
  const setGeez = useFinanceStore((s) => s.setGeezNumerals);
  const transactions = useFinanceStore((s) => s.transactions);
  const accounts = useFinanceStore((s) => s.accounts);
  const resetDemo = useFinanceStore((s) => s.resetDemo);
  const [confirmReset, setConfirmReset] = useState(false);

  function exportCSV() {
    const csv = transactionsToCSV(transactions, accounts);
    downloadCSV(`hisab-transactions-${dateKey(todayEthiopian())}.csv`, csv);
  }

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Settings</h1>
        <p className="mt-1 font-ethiopic text-sm text-muted">ቅንብሮች</p>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardHint>Pick a look for the ledger</CardHint>
          </div>
        </CardHeader>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium transition-colors duration-150",
                theme === t.id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-muted hover:bg-bg-warm",
              )}
            >
              <span className="flex h-8 w-full overflow-hidden rounded-md shadow-border">
                <span className="flex-1" style={{ background: t.swatch[0] }} />
                <span className="flex-1" style={{ background: t.swatch[1] }} />
              </span>
              <span className="flex items-center gap-1">
                {theme === t.id ? <Check className="size-3" /> : null}
                {t.label}
              </span>
              <span className="font-ethiopic text-[11px] text-muted">{t.amharic}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Numerals</CardTitle>
            <CardHint>How month labels and dates are written</CardHint>
          </div>
        </CardHeader>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg-warm p-1">
          <button
            type="button"
            onClick={() => setGeez(false)}
            className={cn(
              "h-10 rounded-md text-sm font-medium transition-colors duration-150",
              !geez ? "bg-surface text-ink shadow-border" : "text-muted",
            )}
          >
            Arabic (123)
          </button>
          <button
            type="button"
            onClick={() => setGeez(true)}
            className={cn(
              "h-10 rounded-md font-ethiopic text-sm font-medium transition-colors duration-150",
              geez ? "bg-surface text-ink shadow-border" : "text-muted",
            )}
          >
            Geʽez (፩፪፫)
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Accounts</CardTitle>
            <CardHint>Bank, cash, and mobile wallets</CardHint>
          </div>
          <Link to="/accounts" className="flex items-center gap-1 text-sm text-accent">
            Manage <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <p className="text-sm text-muted">Track balances separately for each place your money sits.</p>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Export data</CardTitle>
            <CardHint>{transactions.length} entries, ready to download</CardHint>
          </div>
        </CardHeader>
        <Button onClick={exportCSV} variant="secondary" className="w-full sm:w-auto">
          <Download className="size-4" />
          Export as CSV
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Demo data</CardTitle>
            <CardHint>Wipe everything and restore the sample ledger</CardHint>
          </div>
        </CardHeader>
        {confirmReset ? (
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
              }}
            >
              Yes, reset everything
            </Button>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="size-4" />
            Reset demo data
          </Button>
        )}
      </Card>

      <p className="pb-4 text-center text-xs text-faint">Hisab · Developed by Melaku Sisay</p>
    </div>
  );
}
