'use client'

import { motion } from 'framer-motion'

export function BackgroundGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Removed bg-white to allow global background to show through */}
      
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-navy-100/40 to-gold-100/40 blur-3xl"
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-bl from-navy-200/30 to-gold-200/30 blur-3xl"
      />
    </div>
  )
}
