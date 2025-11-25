import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

export function formatChange(change: number) {
  return `${change > 0 ? "+" : ""}${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(change)}%`;
}
