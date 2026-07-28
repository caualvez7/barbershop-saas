'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../DashboardLayout'
import AnimatedCounter from './AnimatedCounter'

export default function KPICard({ title, value, trend, sparklinePoints = [30, 25, 20, 15, 10, 5, 0], icon: Icon, accentColor = '#f59e0b' }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const safePoints = Array.isArray(sparklinePoints) && sparklinePoints.length > 0 ? sparklinePoints : [30, 25, 20, 15, 10, 5, 0]
  const pathD = safePoints.reduce((acc, point, i) => {
    const x = (i / (safePoints.length - 1)) * 100
    const y = point
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, '')

  const areaD = `${pathD} L 100 40 L 0 40 Z`
  const cleanId = String(title || 'kpi').replace(/[^a-zA-Z0-9]/g, '-')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-5 rounded-2xl border relative overflow-hidden group transition-all duration-300 shadow-xl ${
        isDark 
          ? 'border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl hover:border-zinc-800/80' 
          : 'border-zinc-200/80 bg-white hover:border-zinc-300 shadow-md hover:shadow-lg'
      }`}
    >
      {/* Glow Effect */}
      {isHovered && (
        <div 
          className="absolute -inset-[1px] rounded-2xl pointer-events-none z-10 opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, ${accentColor}15, transparent 80%)`,
            border: `1px solid ${accentColor}25`
          }}
        />
      )}

      {/* Sparkline Chart Background */}
      <div className="absolute bottom-0 left-0 right-0 h-11 opacity-25 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none select-none">
        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`spark-grad-${cleanId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#spark-grad-${cleanId})`} />
          <path d={pathD} fill="none" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex justify-between items-start mb-3 relative z-20">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{title}</p>
        <div className={`p-2 rounded-xl border transition-colors ${
          isDark ? 'bg-zinc-950/60 border-zinc-900 group-hover:border-zinc-800' : 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'
        }`}>
          {Icon && <Icon size={14} className="text-zinc-400 group-hover:text-amber-500 transition-colors" />}
        </div>
      </div>

      <div className="flex justify-between items-baseline relative z-20">
        <h3 className={`text-2xl font-bold tracking-tight font-sans ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          <AnimatedCounter value={value} />
        </h3>
        <span className="text-[10px] font-semibold text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/10 shadow-sm">
          {trend}
        </span>
      </div>
    </motion.div>
  )
}
