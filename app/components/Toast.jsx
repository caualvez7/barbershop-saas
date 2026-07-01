'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export default function Toast({ message, type = 'error', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
  }

  const styles = {
    success: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.08)]',
    error: 'bg-red-950/40 border-red-500/20 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.08)]',
    warning: 'bg-amber-950/40 border-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.08)]',
    info: 'bg-blue-950/40 border-blue-500/20 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.08)]'
  }

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed top-6 right-6 z-[9999] max-w-sm w-full md:w-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl ${styles[type]}`}
        >
          {icons[type]}
          
          <div className="flex-1 text-xs font-medium leading-relaxed font-sans pr-2">
            {message}
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 rounded-lg hover:bg-white/5 flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
