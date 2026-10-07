import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function formatMonthName(monthCode: string): string {
  // Accepts "YYYY-MM" like "2027-01" or "2026-08"
  if (!monthCode || !monthCode.includes("-")) return monthCode || "N/A";
  const [year, month] = monthCode.split("-");
  const idx = parseInt(month, 10) - 1;
  return `${MONTH_NAMES[idx] || month} ${year}`;
}

/**
 * Returns available academic years for selection dropdown
 */
export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]; // e.g. [2026, 2027, 2028, 2029]
}

/**
 * Generates all 12 months for a specific year, or a full range across multiple years
 */
export function getMonthsForYear(year: number = 2027): { code: string; label: string }[] {
  return MONTH_NAMES.map((name, idx) => {
    const monthNum = String(idx + 1).padStart(2, "0");
    const code = `${year}-${monthNum}`;
    return {
      code,
      label: `${name} ${year}`,
    };
  });
}

/**
 * Generates an extensive multi-year month options list for dropdown selectors
 */
export function getAllMonthOptions(): { code: string; label: string; year: number }[] {
  const years = [2026, 2027, 2028];
  const list: { code: string; label: string; year: number }[] = [];
  years.forEach((y) => {
    MONTH_NAMES.forEach((name, idx) => {
      const monthNum = String(idx + 1).padStart(2, "0");
      list.push({
        code: `${y}-${monthNum}`,
        label: `${name} ${y}`,
        year: y,
      });
    });
  });
  return list;
}

export function getUpcomingMonths(count: number = 12, startYear: number = 2027): { code: string; label: string }[] {
  return getAllMonthOptions();
}
