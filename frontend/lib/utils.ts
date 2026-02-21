import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'GEL'): string {
  return new Intl.NumberFormat('ka-GE', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date))
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-600',
    rejected: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600'
}
