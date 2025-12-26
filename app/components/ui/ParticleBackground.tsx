'use client'

import { useEffect, useRef } from 'react'

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    let mouse = { x: -1000, y: -1000 }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      baseX: number
      baseY: number
      density: number

      constructor(x: number, y: number) {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.baseX = this.x
        this.baseY = this.y
        this.size = Math.random() * 2 + 1
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
        this.density = (Math.random() * 30) + 1
      }

      draw() {
        if (!ctx) return
        
        // Calculate distance to mouse for color interpolation
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        let maxDistance = 200
        
        // Default color: Gold/Stone (rgba(180, 83, 9, 0.15))
        // Hover color: Navy (rgba(10, 28, 46, 0.8))
        
        if (distance < maxDistance) {
          const t = 1 - (distance / maxDistance) // 0 to 1 based on proximity
          // Interpolate between Gold (180, 83, 9) and Navy (10, 28, 46)
          const r = 180 - (170 * t)
          const g = 83 - (55 * t)
          const b = 9 + (37 * t)
          const a = 0.15 + (0.65 * t)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
        } else {
          ctx.fillStyle = 'rgba(180, 83, 9, 0.15)'
        }

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }

      update() {
        let dx = mouse.x - this.x
        let dy = mouse.y - this.y
        let distance = Math.sqrt(dx * dx + dy * dy)
        let forceDirectionX = dx / distance
        let forceDirectionY = dy / distance
        let maxDistance = 150 // Radius of interaction
        let force = (maxDistance - distance) / maxDistance
        let directionX = forceDirectionX * force * this.density
        let directionY = forceDirectionY * force * this.density

        if (distance < maxDistance) {
          // Move away from mouse
          this.x -= directionX
          this.y -= directionY
        } else {
          // Return to base position
          if (this.x !== this.baseX) {
            let dx = this.x - this.baseX
            this.x -= dx / 20
          }
          if (this.y !== this.baseY) {
            let dy = this.y - this.baseY
            this.y -= dy / 20
          }
        }
      }
    }

    const initParticles = () => {
      particles = []
      // Adjust density based on screen size
      const numberOfParticles = (canvas.width * canvas.height) / 15000
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle(0, 0))
      }
    }

    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw()
        particles[i].update()
      }
      connect()
      animationFrameId = requestAnimationFrame(animate)
    }

    const connect = () => {
      if (!ctx) return
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
            + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y))
          if (distance < (canvas.width/9) * (canvas.height/9)) {
            let opacityValue = 1 - (distance / 20000)
            if (opacityValue > 0) {
                // Check if either particle is near mouse to color the line
                let dx = mouse.x - particles[a].x
                let dy = mouse.y - particles[a].y
                let distToMouse = Math.sqrt(dx*dx + dy*dy)
                
                if (distToMouse < 200) {
                   ctx.strokeStyle = 'rgba(10, 28, 46,' + opacityValue * 0.4 + ')' // Navy lines near mouse
                } else {
                   ctx.strokeStyle = 'rgba(180, 83, 9,' + opacityValue * 0.1 + ')' // Gold lines otherwise
                }
                
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(particles[a].x, particles[a].y)
                ctx.lineTo(particles[b].x, particles[b].y)
                ctx.stroke()
            }
          }
        }
      }
    }

    window.addEventListener('resize', resize)
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.x
      mouse.y = e.y
    }
    window.addEventListener('mousemove', handleMouseMove)

    resize()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  )
}
