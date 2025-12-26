'use client'

import { cn } from '@/app/lib/utils'

export function GlassCard({ children, className, hoverEffect = true }: { children: React.ReactNode, className?: string, hoverEffect?: boolean }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-6 shadow-sm backdrop-blur-md transition-all duration-300",
      hoverEffect && "hover:-translate-y-1 hover:shadow-xl hover:bg-white/60 hover:border-white/80",
      className
    )}>
      {children}
    </div>
  )
}
