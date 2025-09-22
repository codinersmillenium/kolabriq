import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: number): string {
  const ms = Number(date) * 1000;

  return new Date(ms).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function nowStr(): string {
  const now = new Date();
  return now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function isOverdue(due: number): boolean {
  const dueDate = new Date(Number(due) * 1000)
  const today = new Date()

  return dueDate < today
}

export function toE8s(nat: number): number {
  return Math.round(nat * 100_000_000);
}

export function e8sToStr(e8s: bigint | number): string {
  const nat = Number(e8s) / 100_000_000;
  return nat.toLocaleString("en-US", { maximumFractionDigits: 8 });
}
