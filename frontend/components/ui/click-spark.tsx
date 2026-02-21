'use client'

import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Spark {
  id: number
  x: number
  y: number
  angle: number
}

interface ClickSparkProps {
  children: ReactNode
  className?: string
  color?: string
}

export function ClickSpark({ children, className, color = '#00D9F5' }: ClickSparkProps) {
  const [sparks, setSparks] = useState<Spark[]>([])
  const counter = useRef(0)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const base = counter.current++ * 8

    const newSparks: Spark[] = Array.from({ length: 8 }, (_, i) => ({
      id: base + i,
      x,
      y,
      angle: (i / 8) * 360,
    }))

    setSparks((prev) => [...prev, ...newSparks])
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.some((n) => n.id === s.id)))
    }, 700)
  }

  return (
    <div className={cn('relative', className)} onClick={handleClick}>
      {sparks.map((spark) => {
        const rad = (spark.angle * Math.PI) / 180
        const sparkX = Math.cos(rad) * 40
        const sparkY = Math.sin(rad) * 40
        return (
          <div
            key={spark.id}
            aria-hidden="true"
            className="pointer-events-none absolute z-50"
            style={{
              left: spark.x - 3,
              top: spark.y - 3,
              ['--spark-x' as string]: `${sparkX}px`,
              ['--spark-y' as string]: `${sparkY}px`,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: color,
                animation: 'sparkFly 0.65s ease-out forwards',
              }}
            />
          </div>
        )
      })}
      {children}
    </div>
  )
}
