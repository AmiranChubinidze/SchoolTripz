import { cn } from '@/lib/utils'

interface LightRaysProps {
  className?: string
}

export function LightRays({ className }: LightRaysProps) {
  const rays = [
    { angle: -45 }, { angle: -30 }, { angle: -15 },
    { angle: 0 },   { angle: 15 },  { angle: 30 },
    { angle: 45 },  { angle: 60 },
  ]

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none select-none', className)}
      aria-hidden="true"
    >
      {/* Radial purple glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 18% 50%, rgba(124,58,237,0.13) 0%, transparent 65%)',
        }}
      />
      {/* Secondary glow top-right */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 90% 10%, rgba(0,217,245,0.05) 0%, transparent 60%)',
        }}
      />
      {/* Ray lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.35]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {rays.map((ray, i) => {
          const rad = (ray.angle * Math.PI) / 180
          const x2 = 220 + Math.cos(rad) * 2000
          const y2 = 450 + Math.sin(rad) * 2000
          return (
            <line
              key={i}
              x1="220"
              y1="450"
              x2={x2}
              y2={y2}
              stroke="rgba(124,58,237,0.08)"
              strokeWidth="1.5"
            />
          )
        })}
      </svg>
    </div>
  )
}
