/**
 * Ethiopian (Ethiopic / Geʽez) calendar — Beyene–Kudlek / ICU Amete Mihret.
 * 12 months of 30 days + Pagume (5, or 6 when year % 4 === 3).
 */

export type EthDate = {
  year: number;
  month: number;
  day: number;
};

export type GregDate = {
  year: number;
  month: number;
  day: number;
};

export const ETHIOPIAN_MONTHS = [
  { index: 1, name: "Meskerem", amharic: "መስከረም" },
  { index: 2, name: "Tikimt", amharic: "ጥቅምት" },
  { index: 3, name: "Hidar", amharic: "ኅዳር" },
  { index: 4, name: "Tahsas", amharic: "ታኅሣሥ" },
  { index: 5, name: "Tir", amharic: "ጥር" },
  { index: 6, name: "Yekatit", amharic: "የካቲት" },
  { index: 7, name: "Megabit", amharic: "መጋቢት" },
  { index: 8, name: "Miazia", amharic: "ሚያዝያ" },
  { index: 9, name: "Ginbot", amharic: "ግንቦት" },
  { index: 10, name: "Sene", amharic: "ሰኔ" },
  { index: 11, name: "Hamle", amharic: "ሐምሌ" },
  { index: 12, name: "Nehase", amharic: "ነሐሴ" },
  { index: 13, name: "Pagume", amharic: "ጳጉሜ" },
] as const;

export const WEEKDAYS = [
  { index: 0, name: "Ehud", amharic: "እሑድ", short: "እሑ", latinShort: "Eh" },
  { index: 1, name: "Segno", amharic: "ሰኞ", short: "ሰኞ", latinShort: "Se" },
  { index: 2, name: "Maksegno", amharic: "ማክሰኞ", short: "ማክ", latinShort: "Ma" },
  { index: 3, name: "Rob", amharic: "ረቡዕ", short: "ረቡ", latinShort: "Ro" },
  { index: 4, name: "Hamus", amharic: "ሐሙስ", short: "ሐሙ", latinShort: "Ha" },
  { index: 5, name: "Arb", amharic: "ዓርብ", short: "ዓር", latinShort: "Ar" },
  { index: 6, name: "Kidame", amharic: "ቅዳሜ", short: "ቅዳ", latinShort: "Ki" },
] as const;

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;

const GEEZ_ONES = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"] as const;
const GEEZ_TENS = ["", "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺"] as const;

export function isEthiopianLeapYear(year: number): boolean {
  return ((year % 4) + 4) % 4 === 3;
}

export function daysInEthiopianMonth(year: number, month: number): number {
  if (month < 1 || month > 13) return 0;
  if (month === 13) return isEthiopianLeapYear(year) ? 6 : 5;
  return 30;
}

export function ethiopianToJdn(year: number, month: number, day: number): number {
  return 1723856 + 365 * year + Math.floor(year / 4) + 30 * month + day - 31;
}

export function jdnToEthiopian(jdn: number): EthDate {
  const offset = jdn - JD_EPOCH_OFFSET_AMETE_MIHRET;
  const r = ((offset % 1461) + 1461) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor(offset / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

export function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function jdnToGregorian(jdn: number): GregDate {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

export function toGregorian(eth: EthDate): GregDate {
  return jdnToGregorian(ethiopianToJdn(eth.year, eth.month, eth.day));
}

export function fromGregorian(greg: GregDate): EthDate {
  return jdnToEthiopian(gregorianToJdn(greg.year, greg.month, greg.day));
}

export function todayEthiopian(now: Date = new Date()): EthDate {
  // Ethiopia observes UTC+3 year-round (Africa/Addis_Ababa).
  const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
  const eat = new Date(utc + 3 * 3_600_000);
  return fromGregorian({
    year: eat.getUTCFullYear(),
    month: eat.getUTCMonth() + 1,
    day: eat.getUTCDate(),
  });
}

export function weekdayOf(eth: EthDate): number {
  // Same 7-day week as Gregorian. JDN 0 is a Monday; we want 0 = Sunday.
  const jdn = ethiopianToJdn(eth.year, eth.month, eth.day);
  return (jdn + 1) % 7;
}

export function monthName(month: number, script: "latin" | "amharic" = "latin"): string {
  const entry = ETHIOPIAN_MONTHS[month - 1];
  if (!entry) return "";
  return script === "amharic" ? entry.amharic : entry.name;
}

export function toGeezNumeral(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  const value = Math.floor(n);
  if (value === 0) return "0";
  if (value < 10) return GEEZ_ONES[value] ?? String(value);
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return `${GEEZ_TENS[tens] ?? ""}${GEEZ_ONES[ones] ?? ""}`;
  }
  if (value < 10000) {
    const hundreds = Math.floor(value / 100);
    const rest = value % 100;
    const hundredMark = hundreds === 1 ? "፻" : `${toGeezNumeral(hundreds)}፻`;
    return rest === 0 ? hundredMark : `${hundredMark}${toGeezNumeral(rest)}`;
  }
  return String(value);
}

export function dateKey(eth: EthDate): string {
  return `${eth.year}-${String(eth.month).padStart(2, "0")}-${String(eth.day).padStart(2, "0")}`;
}

export function parseDateKey(key: string): EthDate | null {
  const match = /^(\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidEthDate({ year, month, day })) return null;
  return { year, month, day };
}

export function isValidEthDate(eth: EthDate): boolean {
  if (!Number.isInteger(eth.year) || eth.year < 1) return false;
  if (!Number.isInteger(eth.month) || eth.month < 1 || eth.month > 13) return false;
  const dim = daysInEthiopianMonth(eth.year, eth.month);
  return Number.isInteger(eth.day) && eth.day >= 1 && eth.day <= dim;
}

export function compareEthDates(a: EthDate, b: EthDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function addEthiopianDays(eth: EthDate, days: number): EthDate {
  return jdnToEthiopian(ethiopianToJdn(eth.year, eth.month, eth.day) + days);
}

export function addEthiopianMonths(eth: EthDate, delta: number): EthDate {
  const absolute = eth.year * 13 + (eth.month - 1) + delta;
  const year = Math.floor(absolute / 13);
  const month = (absolute % 13) + 1;
  const dim = daysInEthiopianMonth(year, month);
  return { year, month, day: Math.min(eth.day, dim) };
}

export function startOfEthiopianMonth(eth: Pick<EthDate, "year" | "month">): EthDate {
  return { year: eth.year, month: eth.month, day: 1 };
}

export function endOfEthiopianMonth(eth: Pick<EthDate, "year" | "month">): EthDate {
  return {
    year: eth.year,
    month: eth.month,
    day: daysInEthiopianMonth(eth.year, eth.month),
  };
}

export function isSameEthDay(a: EthDate, b: EthDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function isSameEthMonth(a: Pick<EthDate, "year" | "month">, b: Pick<EthDate, "year" | "month">): boolean {
  return a.year === b.year && a.month === b.month;
}

export type CalendarCell = {
  date: EthDate;
  weekday: number;
  inMonth: boolean;
  holiday?: string;
  holidayAmharic?: string;
};

export function monthGrid(year: number, month: number): CalendarCell[] {
  const dim = daysInEthiopianMonth(year, month);
  const firstWeekday = weekdayOf({ year, month, day: 1 });
  const cells: CalendarCell[] = [];
  const hols = holidaysForMonth(year, month);

  for (let i = 0; i < firstWeekday; i++) {
    cells.push({
      date: { year, month, day: 0 },
      weekday: i,
      inMonth: false,
    });
  }

  for (let day = 1; day <= dim; day++) {
    const date = { year, month, day };
    const hol = hols.get(day);
    cells.push({
      date,
      weekday: weekdayOf(date),
      inMonth: true,
      holiday: hol?.en,
      holidayAmharic: hol?.am,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({
      date: { year, month, day: 0 },
      weekday: cells.length % 7,
      inMonth: false,
    });
  }

  return cells;
}

type Holiday = { en: string; am: string };

const FIXED_HOLIDAYS: Record<string, Holiday> = {
  "1-1": { en: "Enkutatash", am: "እንቁጣጣሽ" },
  "1-17": { en: "Meskel", am: "መስቀል" },
  "4-29": { en: "Genna", am: "ገና" },
  "5-11": { en: "Timket", am: "ጥምቀት" },
  "6-23": { en: "Adwa", am: "ዓድዋ" },
  "8-23": { en: "Labour Day", am: "የላብ አደር" },
  "9-20": { en: "Ginbot 20", am: "ግንቦት ፳" },
};

export function holidaysForMonth(year: number, month: number): Map<number, Holiday> {
  const map = new Map<number, Holiday>();
  for (const [key, value] of Object.entries(FIXED_HOLIDAYS)) {
    const [m, d] = key.split("-").map(Number);
    if (m === month && d && d <= daysInEthiopianMonth(year, month)) {
      map.set(d, value);
    }
  }
  return map;
}

export function formatEthDate(
  eth: EthDate,
  opts: { geez?: boolean; weekday?: boolean; script?: "latin" | "amharic" | "both" } = {},
): string {
  const script = opts.script ?? "both";
  const month = ETHIOPIAN_MONTHS[eth.month - 1];
  if (!month) return dateKey(eth);
  const dayStr = opts.geez ? toGeezNumeral(eth.day) : String(eth.day);
  const yearStr = opts.geez ? toGeezNumeral(eth.year) : String(eth.year);
  let core: string;
  if (script === "amharic") {
    core = `${month.amharic} ${dayStr}፣ ${yearStr}`;
  } else if (script === "latin") {
    core = `${month.name} ${dayStr}, ${yearStr}`;
  } else {
    core = `${month.amharic} ${dayStr} · ${month.name} ${yearStr}`;
  }
  if (opts.weekday) {
    const wd = WEEKDAYS[weekdayOf(eth)];
    const prefix = wd ? `${wd.amharic} · ` : "";
    return `${prefix}${core}`;
  }
  return core;
}

export function formatGregorianShort(greg: GregDate): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[greg.month - 1] ?? ""} ${greg.day}, ${greg.year}`;
}

export function monthLabel(year: number, month: number, geez = false): { amharic: string; latin: string; year: string } {
  const m = ETHIOPIAN_MONTHS[month - 1];
  return {
    amharic: m?.amharic ?? "",
    latin: m?.name ?? "",
    year: geez ? toGeezNumeral(year) : String(year),
  };
}
