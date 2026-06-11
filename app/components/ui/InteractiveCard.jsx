'use client'

import React, { useRef, useState } from 'react'

export default function InteractiveCard({ children, className = '' }) {
  const cardRef = useRef(null)
  const [style, setStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease'
  })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    
    // Mouse coords relative to card
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Normalize coordinates from -0.5 to 0.5
    const px = (x / rect.width) - 0.5
    const py = (y / rect.height) - 0.5
    
    // Calculate 3D rotations (max 12 degrees)
    const rotateX = -(py * 12).toFixed(2)
    const rotateY = (px * 12).toFixed(2)
    
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease'
    })
    
    cardRef.current.style.setProperty('--mouse-x', `${x}px`)
    cardRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease'
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md relative overflow-hidden group hover:border-zinc-700/85 shadow-lg shadow-black/20 ${className}`}
    >
      {/* 1. Mouse Tracking Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(350px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(245,158,11,0.06),transparent_80%)]" />
      
      {/* 2. Shine Reflection Overlay */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none bg-gradient-to-r from-transparent via-white/[0.05] to-transparent z-10" />

      {/* 3. Golden Corner Highlights */}
      <div className="absolute top-0 left-0 w-[1px] h-0 group-hover:h-8 bg-gradient-to-b from-amber-500 to-transparent transition-all duration-500" />
      <div className="absolute top-0 left-0 h-[1px] w-0 group-hover:w-8 bg-gradient-to-r from-amber-500 to-transparent transition-all duration-500" />

      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}
