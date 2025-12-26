'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/app/lib/utils'

interface SymbioteButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'gold-glow'
}

export function SymbioteButton({ href, children, className, variant = 'primary' }: SymbioteButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [blobs, setBlobs] = useState<{ left: string; top: string; delay: number }[]>([])

  useEffect(() => {
    setBlobs([...Array(5)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 0.2
    })))
  }, [])

  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full px-8 font-medium transition-all duration-300",
        variant === 'primary' 
          ? "bg-navy-900 text-white" 
          : "bg-white text-navy-900 border border-gold-400 shadow-[0_0_15px_rgba(180,83,9,0.3)] hover:shadow-[0_0_25px_rgba(180,83,9,0.6)] hover:border-gold-500",
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
        {/* Multiple infection points for parasite spread effect */}
        {blobs.map((blob, i) => (
           <motion.div
             key={i}
             className="absolute bg-[#292929] rounded-full opacity-95"
             initial={{ scale: 0 }}
             animate={{
               scale: isHovered ? 30 : 0,
             }}
             style={{
               left: blob.left,
               top: blob.top,
               width: '20px',
               height: '20px',
             }}
             transition={{
               duration: 1.5, // Slower spread
               delay: blob.delay,
               ease: "easeInOut"
             }}
           />
        ))}
      </div>

      {/* Content */}
      <div className={cn(
        "relative z-10 flex items-center transition-all duration-300",
        isHovered 
          ? "text-gold-shimmer font-bold" 
          : (variant === 'primary' ? "text-white" : "text-navy-900")
      )}>
        {children}
      </div>
    </Link>
  )
}
