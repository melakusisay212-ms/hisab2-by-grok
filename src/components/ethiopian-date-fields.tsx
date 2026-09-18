import {
  ETHIOPIAN_MONTHS,
  daysInEthiopianMonth,
  todayEthiopian,
  type EthDate,
} from "@/lib/ethiopian";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EthiopianDateFields({
  value,
  onChange,
}: {
  value: EthDate;
  onChange: (next: EthDate) => void;
}) {
  const today = todayEthiopian();
  const years = Array.from({ length: 12 }, (_, i) => today.year - 8 + i);
  const dim = daysInEthiopianMonth(value.year, value.month);

  function patch(partial: Partial<EthDate>) {
    const next = { ...value, ...partial };
    const max = daysInEthiopianMonth(next.year, next.month);
    onChange({ ...next, day: Math.min(next.day, max) });
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label className="mb-0">Ethiopian date</Label>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => onChange(today)}>
          Today
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <NativeSelect
          aria-label="Day"
          value={value.day}
          onChange={(e) => patch({ day: Number(e.target.value) })}
        >
          {Array.from({ length: dim }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Month"
          value={value.month}
          onChange={(e) => patch({ month: Number(e.target.value) })}
        >
          {ETHIOPIAN_MONTHS.map((m) => (
            <option key={m.index} value={m.index}>
              {m.amharic} · {m.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          aria-label="Year"
          value={value.year}
          onChange={(e) => patch({ year: Number(e.target.value) })}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
