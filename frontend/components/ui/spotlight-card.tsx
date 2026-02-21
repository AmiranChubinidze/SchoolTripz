'use client'

import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function SpotlightCard({
  children,
  className,
  glowColor = 'rgba(124, 58, 237, 0.2)',
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Spotlight glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(380px circle at ${pos.x}px ${pos.y}px, ${glowColor} 0%, transparent 65%)`,
          opacity: visible ? 1 : 0,
        }}
      />
      {/* Border highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          background: `radial-gradient(200px circle at ${pos.x}px ${pos.y}px, rgba(124,58,237,0.3) 0%, transparent 65%)`,
          opacity: visible ? 1 : 0,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
