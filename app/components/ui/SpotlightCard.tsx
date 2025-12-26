'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/app/lib/utils'

export function SpotlightCard({ 
  children, 
  className = "", 
  innerClassName = "",
  spotlightColor = "rgba(180, 83, 9, 0.1)" // Darker Gold
}: { 
  children: React.ReactNode
  className?: string
  innerClassName?: string
  spotlightColor?: string
}) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const [blobs, setBlobs] = useState<{ left: string; top: string; delay: number }[]>([])

  useEffect(() => {
    setBlobs([...Array(8)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 0.3
    })))
  }, [])

  // 3D Tilt Effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return

    const rect = divRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    
    x.set(xPct)
    y.set(yPct)

    setPosition({ x: mouseX, y: mouseY })
  }

  const handleFocus = () => {
    setOpacity(1)
  }

  const handleBlur = () => {
    setOpacity(0)
  }

  const handleMouseEnter = () => {
    setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-stone-200 bg-white p-1 shadow-sm transition-all duration-300",
        "hover:shadow-[0_0_40px_rgba(180,83,9,0.3)] hover:border-gold-500/50", // Gold glow effect
        className
      )}
    >
      {/* Inner Gold Frame */}
      <div className="absolute inset-1 rounded-lg border border-gold-200/50 pointer-events-none z-20" />
      
      <div className={cn("relative h-full w-full rounded-lg bg-white p-6 overflow-hidden", innerClassName)} style={{ transform: "translateZ(20px)" }}>
        {/* Symbiote Liquid Container */}
        <div 
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none" 
          style={{ filter: "url(#goo)" }}
        >
          {blobs.map((blob, i) => (
             <motion.div
               key={i}
               className="absolute bg-[#292929] rounded-full opacity-95"
               initial={{ scale: 0 }}
               animate={{
                 scale: opacity === 1 ? 80 : 0,
               }}
               style={{
                 left: blob.left,
                 top: blob.top,
                 width: '40px',
                 height: '40px',
               }}
               transition={{
                 duration: opacity === 1 ? 2 : 0.5, // Slower spread in, fast retreat out
                 delay: opacity === 1 ? blob.delay : 0,
                 ease: "easeInOut"
               }}
             />
          ))}
        </div>

        {/* Reflective Glass Overlay (Black Pool Effect) */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
          style={{ 
            opacity: opacity === 1 ? 1 : 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.2) 100%)',
            backdropFilter: 'blur(0.5px)'
          }}
        />

        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-10"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
          }}
        />
        
        {/* Content with Gold Transition */}
        <div className="relative z-30 transition-all duration-500 group-hover:[&_*]:text-gold-shimmer group-hover:[&_span]:text-gold-shimmer group-hover:[&_div]:border-gold-500/30">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
