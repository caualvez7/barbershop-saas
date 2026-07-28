'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useTheme } from '../DashboardLayout'

export default function AnalyticsChart({ chartData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const xPercent = x / rect.width
    const xVal = xPercent * 300
    const index = Math.max(0, Math.min(6, Math.round(xVal / 50)))
    setHoveredIndex(index)
  }

  if (!chartData || chartData.length === 0) return null

  // Construct dynamic SVG path coords
  const points = chartData.map((d) => `${d.x} ${d.y}`)
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`).join(' ')
  const areaD = `${pathD} L 300 120 L 0 120 Z`

  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between h-full shadow-xl ${
      isDark ? 'border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl' : 'border-zinc-200/80 bg-white shadow-md'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Receita dos Últimos 7 Dias</p>
          <p className="text-[10px] text-zinc-500">Acompanhamento de fluxo de faturamento</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10">
          <TrendingUp size={10} />
          <span>Faturamento Real</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        className="h-44 w-full relative flex items-end cursor-crosshair select-none"
      >
        <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="main-chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={isDark ? 0.25 : 0.15} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="main-line-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1="0" y1="30" x2="300" y2="30" stroke={isDark ? "#18181b" : "#e5e3dd"} strokeDasharray="3,3" />
          <line x1="0" y1="60" x2="300" y2="60" stroke={isDark ? "#18181b" : "#e5e3dd"} strokeDasharray="3,3" />
          <line x1="0" y1="90" x2="300" y2="90" stroke={isDark ? "#18181b" : "#e5e3dd"} strokeDasharray="3,3" />
          
          {/* Gradient area */}
          <path d={areaD} fill="url(#main-chart-grad)" />
          
          {/* Line path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#main-line-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
          />

          {/* Hover tracker line */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <line
              x1={chartData[hoveredIndex].x}
              y1="0"
              x2={chartData[hoveredIndex].x}
              y2="120"
              stroke={isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(217, 119, 6, 0.4)"}
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
          )}

          {/* Snapped glow rings */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <>
              <circle
                cx={chartData[hoveredIndex].x}
                cy={chartData[hoveredIndex].y}
                r="8"
                className="fill-amber-500/20 stroke-none animate-ping"
                style={{ transformOrigin: `${chartData[hoveredIndex].x}px ${chartData[hoveredIndex].y}px` }}
              />
              <circle
                cx={chartData[hoveredIndex].x}
                cy={chartData[hoveredIndex].y}
                r="5.5"
                className="fill-amber-500 stroke-white stroke-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              />
            </>
          )}
        </svg>

        {/* Floating tooltip element */}
        <AnimatePresence>
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                left: `${(chartData[hoveredIndex].x / 300) * 100}%`,
                top: `${(chartData[hoveredIndex].y / 120) * 100}%`
              }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%) translateY(-14px)',
                pointerEvents: 'none',
                zIndex: 50
              }}
              className={`border rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[130px] ${
                isDark ? 'bg-[#09090b]/95 border-amber-500/30 text-zinc-100' : 'bg-white/95 border-amber-500/20 text-zinc-900 shadow-lg'
              }`}
            >
              <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                {chartData[hoveredIndex].label}
              </p>
              <div className="flex flex-col mt-1">
                <span className="text-[8px] text-zinc-400 leading-none">Faturamento</span>
                <span className="text-xs font-bold text-amber-500 font-sans leading-normal">
                  {chartData[hoveredIndex].revenue}
                </span>
                <span className="text-[8px] text-blue-500 font-semibold mt-0.5">
                  {chartData[hoveredIndex].appointments} agendamentos
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Labels below chart */}
        <div className={`w-full flex justify-between text-[8px] text-zinc-600 font-mono mt-1 pt-2 border-t pointer-events-none select-none ${
          isDark ? 'border-zinc-900' : 'border-zinc-200/80'
        }`}>
          {chartData.map((d, idx) => (
            <span 
              key={idx} 
              className={`transition-colors duration-200 ${
                hoveredIndex === idx ? (isDark ? 'text-amber-400 font-bold' : 'text-amber-600 font-bold') : ''
              }`}
            >
              {d.date}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
