'use client'

import { useEffect, useState } from 'react'

export default function AnimatedCounter({ value, duration = 1.2 }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const isCurrency = typeof value === 'string' && value.includes('R$')
    const numericTarget = isCurrency 
      ? parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) 
      : parseInt(value)

    if (isNaN(numericTarget)) {
      setDisplayValue(value)
      return
    }

    let start = 0
    const end = numericTarget
    const increment = end / (duration * 60)
    let current = start

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        clearInterval(timer)
        setDisplayValue(value)
      } else {
        if (isCurrency) {
          setDisplayValue(
            'R$ ' + Math.round(current).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          )
        } else {
          setDisplayValue(Math.round(current))
        }
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{displayValue}</span>
}
