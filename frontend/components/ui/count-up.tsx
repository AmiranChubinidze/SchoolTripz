'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function CountUp({ end, suffix = '', prefix = '', duration = 2200, className }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    let raf1: number, raf2: number
    // Double-RAF: ensures the element is fully painted before observing,
    // so IntersectionObserver fires after the initial render is committed.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && !started.current) {
              started.current = true
              const startTime = performance.now()
              const tick = (now: number) => {
                const elapsed = now - startTime
                const progress = Math.min(elapsed / duration, 1)
                const eased = 1 - Math.pow(1 - progress, 3)
                setCount(Math.round(eased * end))
                if (progress < 1) requestAnimationFrame(tick)
              }
              requestAnimationFrame(tick)
            }
          },
          { threshold: 0.4 }
        )
        if (ref.current) observer.observe(ref.current)
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [end, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
