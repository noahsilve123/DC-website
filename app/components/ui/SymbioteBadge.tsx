'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/app/lib/utils'

interface SymbioteBadgeProps {
  children: React.ReactNode
  className?: string
}

export function SymbioteBadge({ children, className }: SymbioteBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [blobs, setBlobs] = useState<{ left: string; top: string; delay: number }[]>([])

  useEffect(() => {
    setBlobs([...Array(3)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 0.2
    })))
  }, [])

  return (
    <div
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-full bg-white border border-stone-200 px-4 py-1.5 text-xs font-bold text-navy-600 shadow-sm overflow-hidden transition-all duration-300",
        "hover:border-gold-500/50 hover:shadow-[0_0_15px_rgba(180,83,9,0.3)]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Symbiote Liquid Container */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden" 
        style={{ filter: "url(#goo)" }}
      >
        {blobs.map((blob, i) => (
           <motion.div
             key={i}
             className="absolute bg-[#292929] rounded-full opacity-95"
             initial={{ scale: 0 }}
             animate={{
               scale: isHovered ? 20 : 0,
             }}
             style={{
               left: blob.left,
               top: blob.top,
               width: '15px',
               height: '15px',
             }}
             transition={{
               duration: 1.2,
               delay: blob.delay,
               ease: "easeInOut"
             }}
           />
        ))}
      </div>

      {/* Content */}
      <div className={cn(
        "relative z-10 flex items-center gap-2 transition-all duration-300",
        isHovered ? "text-white" : "text-navy-600"
      )}>
        {children}
      </div>
    </div>
  )
}
