import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(paisa: number | null | undefined): string {
  if (paisa === null || paisa === undefined) return 'Quote on Request';
  return `₹${(paisa / 100).toLocaleString('en-IN')}`;
}

export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'CONFIRMED':
    case 'ACCEPTED':
    case 'PAID':
      return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'IN_PRODUCTION':
    case 'QUOTED':
      return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    case 'OUT_FOR_DELIVERY':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'DELIVERED':
      return 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30';
    case 'CANCELLED':
    case 'REJECTED':
    case 'FAILED':
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    case 'PENDING':
    default:
      return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
}

export function getCategoryBadge(category: string) {
  switch (category) {
    case 'WINDOW':
      return { label: 'Windows', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' };
    case 'DOOR':
      return { label: 'Doors', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' };
    case 'BRICK':
      return { label: 'Bricks', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' };
    case 'POOL':
      return { label: 'Pools', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' };
    default:
      return { label: category, color: 'bg-slate-500/10 text-slate-600' };
  }
}
