'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardMockup() {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const containerRef = useRef(null)

  const chartData = [
    { day: 'SEG', label: 'Segunda-feira, 01/06', revenue: 'R$ 1.850', appointments: 28, x: 0, y: 110 },
    { day: 'TER', label: 'Terça-feira, 02/06', revenue: 'R$ 2.450', appointments: 36, x: 50, y: 84 },
    { day: 'QUA', label: 'Quarta-feira, 03/06', revenue: 'R$ 2.100', appointments: 31, x: 100, y: 85 },
    { day: 'QUI', label: 'Quinta-feira, 04/06', revenue: 'R$ 3.800', appointments: 52, x: 150, y: 62 },
    { day: 'SEX', label: 'Sexta-feira, 05/06', revenue: 'R$ 5.120', appointments: 78, x: 200, y: 40 },
    { day: 'SÁB', label: 'Sábado-feira, 06/06', revenue: 'R$ 7.450', appointments: 112, x: 250, y: 22 },
    { day: 'DOM', label: 'Domingo, 07/06', revenue: 'R$ 6.800', appointments: 98, x: 300, y: 20 }
  ]

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const xPercent = x / rect.width
    const xVal = xPercent * 300
    const index = Math.max(0, Math.min(6, Math.round(xVal / 50)))
    setHoveredIndex(index)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
  }

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-[#09090b]/85 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
      {/* Glow effect in background */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header of Mockup */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b border-zinc-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 block" />
          </div>
          <span className="text-zinc-600">/</span>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded">
            dashboard.barbershop.br
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-medium px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            Junho, 2026
          </span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-[10px] font-bold text-black font-sans shadow shadow-amber-500/20">
            BB
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Faturamento Mensal', val: 'R$ 24.680', trend: '+14.2%', green: true },
          { label: 'Agendamentos', val: '412', trend: '+8.4%', green: true },
          { label: 'Ticket Médio', val: 'R$ 68,50', trend: '+3.1%', green: true },
          { label: 'Recorrência (LTV)', val: '86%', trend: '+1.5%', green: true }
        ].map((card, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm relative overflow-hidden hover:border-zinc-700/80 transition-all duration-300">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">{card.label}</p>
            <div className="flex justify-between items-baseline">
              <span className="text-lg font-bold text-white font-sans">{card.val}</span>
              <span className="text-[10px] text-emerald-400 font-medium px-1.5 py-0.5 bg-emerald-500/10 rounded-md">
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/40 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs font-semibold text-zinc-300">Desempenho Semanal</p>
              <p className="text-[10px] text-zinc-500">Fluxo de receita dos últimos 7 dias</p>
            </div>
            <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Tempo Real
            </span>
          </div>

          {/* SVG Graph representation with Magnetic Hover */}
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="h-36 w-full relative mt-2 flex items-end cursor-crosshair select-none"
          >
            <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-chart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="300" y2="30" stroke="#1f1f23" strokeDasharray="3,3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#1f1f23" strokeDasharray="3,3" />
              <line x1="0" y1="90" x2="300" y2="90" stroke="#1f1f23" strokeDasharray="3,3" />
              
              {/* Path area */}
              <path
                d="M 0 110 Q 50 70 100 85 T 200 40 T 300 20 L 300 120 L 0 120 Z"
                fill="url(#gradient-chart)"
              />
              
              {/* Main Line */}
              <path
                d="M 0 110 Q 50 70 100 85 T 200 40 T 300 20"
                fill="none"
                stroke="rgb(245, 158, 11)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]"
              />

              {/* Hover Vertical Line */}
              {hoveredIndex !== null && (
                <line
                  x1={chartData[hoveredIndex].x}
                  y1="0"
                  x2={chartData[hoveredIndex].x}
                  y2="120"
                  stroke="rgba(245, 158, 11, 0.35)"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
              )}

              {/* Dots at peaks (fade out when hovered) */}
              <circle cx="100" cy="85" r="4" className={`fill-amber-500 stroke-zinc-950 stroke-2 transition-opacity duration-300 ${hoveredIndex !== null ? 'opacity-30' : 'opacity-100'}`} />
              <circle cx="200" cy="40" r="4" className={`fill-amber-500 stroke-zinc-950 stroke-2 transition-opacity duration-300 ${hoveredIndex !== null ? 'opacity-30' : 'opacity-100'}`} />
              <circle cx="300" cy="20" r="4" className={`fill-amber-500 stroke-zinc-950 stroke-2 transition-opacity duration-300 ${hoveredIndex !== null ? 'opacity-30' : 'opacity-100'}`} />

              {/* Active Snapping Dot (Magnetic) */}
              {hoveredIndex !== null && (
                <>
                  <circle
                    cx={chartData[hoveredIndex].x}
                    cy={chartData[hoveredIndex].y}
                    r="8"
                    className="fill-amber-500/30 stroke-none animate-ping"
                    style={{ transformOrigin: `${chartData[hoveredIndex].x}px ${chartData[hoveredIndex].y}px` }}
                  />
                  <circle
                    cx={chartData[hoveredIndex].x}
                    cy={chartData[hoveredIndex].y}
                    r="5.5"
                    className="fill-amber-500 stroke-white stroke-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  />
                </>
              )}
            </svg>

            {/* Tooltip Card (Snapping above dot) */}
            <AnimatePresence>
              {hoveredIndex !== null && (
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
                  className="bg-[#09090b]/95 border border-amber-500/30 rounded-lg p-2.5 shadow-2xl backdrop-blur-md min-w-[125px] text-left pointer-events-none"
                >
                  <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    {chartData[hoveredIndex].label}
                  </p>
                  <div className="flex flex-col mt-0.5">
                    <span className="text-[8px] text-zinc-400">Faturamento</span>
                    <span className="text-xs font-bold text-amber-500 font-sans leading-tight">
                      {chartData[hoveredIndex].revenue}
                    </span>
                    <span className="text-[8px] text-emerald-400 font-semibold mt-0.5">
                      {chartData[hoveredIndex].appointments} agendamentos
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* X-Axis Labels */}
            <div className="w-full flex justify-between text-[9px] text-zinc-600 font-mono mt-1 pt-2 border-t border-zinc-900/60 pointer-events-none select-none">
              {chartData.map((data, idx) => (
                <span 
                  key={idx}
                  className={`transition-colors duration-200 ${hoveredIndex === idx ? 'text-amber-500 font-bold' : ''}`}
                >
                  {data.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* List Card */}
        <div className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-950/40">
          <p className="text-xs font-semibold text-zinc-300 mb-4">Próximos Clientes</p>
          <div className="flex flex-col gap-3">
            {[
              { name: 'Gustavo Santos', service: 'Corte Degradê + Barba', time: '14:30', price: 'R$ 75', barber: 'Thiago' },
              { name: 'Bernardo Lima', service: 'Cinto de Barba / Toalha Quente', time: '15:15', price: 'R$ 45', barber: 'Felipe' },
              { name: 'Arthur Oliveira', service: 'Corte Infantil Premium', time: '16:00', price: 'R$ 55', barber: 'Thiago' }
            ].map((appt, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-900 hover:bg-zinc-900/60 transition-all">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-zinc-200 truncate">{appt.name}</p>
                  <p className="text-[9px] text-zinc-500 truncate">{appt.service} · {appt.barber}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-[10px] font-bold text-amber-500">{appt.price}</p>
                  <p className="text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded font-mono mt-0.5">{appt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
