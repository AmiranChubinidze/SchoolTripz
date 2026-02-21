'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GradualBlurProps {
  children: ReactNode
  className?: string
  delay?: number
  threshold?: number
}

export function GradualBlur({
  children,
  className,
  delay = 0,
  threshold = 0.1,
}: GradualBlurProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let raf1: number, raf2: number
    // Double-RAF: guarantees the browser paints the initial opacity:0 state
    // before we start observing, so the CSS transition has a "from" frame.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) setVisible(true)
          },
          { threshold }
        )
        if (ref.current) observer.observe(ref.current)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [threshold])

  return (
    <div
      ref={ref}
      className={cn('will-change-transform', className)}
      style={{
        transition: `opacity 800ms ease ${delay}ms, filter 800ms ease ${delay}ms, transform 800ms ease ${delay}ms`,
        filter: visible ? 'blur(0px)' : 'blur(8px)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : 'translateY(24px)',
      }}
    >
      {children}
    </div>
  )
}
