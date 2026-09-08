import { MONTH_NAMES_UZ } from "../constants/month-names.js";

export function formatEventDateUz(iso: string): string {
  const date = new Date(iso);
  const day = date.getUTCDate();
  const month = MONTH_NAMES_UZ[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day}-${month}, ${year}-yil`;
}
