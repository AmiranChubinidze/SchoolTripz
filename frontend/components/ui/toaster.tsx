'use client'
import { useToast } from '@/hooks/use-toast'
import { X } from 'lucide-react'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg bg-white animate-fade-in ${
            toast.variant === 'destructive' ? 'border-red-200 bg-red-50' : 'border-slate-200'
          }`}
        >
          <div className="flex-1">
            {toast.title && (
              <p className={`text-sm font-semibold ${toast.variant === 'destructive' ? 'text-red-800' : 'text-slate-900'}`}>
                {toast.title}
              </p>
            )}
            {toast.description && (
              <p className={`text-sm mt-0.5 ${toast.variant === 'destructive' ? 'text-red-700' : 'text-slate-600'}`}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
