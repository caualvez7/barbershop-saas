'use client'

import React, { useEffect, useState, useRef } from 'react'

export default function NumberTicker({ value, duration = 2000, prefix = '', suffix = '', decimals = 0, startImmediately = false }) {
  const [currentVal, setCurrentVal] = useState(0)
  const elementRef = useRef(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (startImmediately) {
      const timer = setTimeout(() => {
        setHasStarted(true)
      }, 250) // Aguarda o sumiço do loading para começar de forma visível
      return () => clearTimeout(timer)
    }

    let observer = null

    // Função de verificação manual para cobrir elementos no topo escondidos por telas de loading iniciais
    const checkVisibility = () => {
      if (!elementRef.current) return
      const rect = elementRef.current.getBoundingClientRect()
      const isVisible = rect.top >= 0 && rect.top <= window.innerHeight
      if (isVisible && !hasStarted) {
        setHasStarted(true)
      }
    }

    const checkTimer = setTimeout(checkVisibility, 350)

    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true)
          }
        },
        { threshold: 0.05 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }
    }, 150)

    return () => {
      clearTimeout(timer)
      clearTimeout(checkTimer)
      if (observer && elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [hasStarted, startImmediately])

  useEffect(() => {
    if (!hasStarted) return

    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      
      // Calculate current value based on progress
      const easedProgress = 1 - Math.pow(1 - progress, 3) // Cubic ease-out
      const val = easedProgress * value
      
      setCurrentVal(val)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCurrentVal(value)
      }
    }

    window.requestAnimationFrame(step)
  }, [hasStarted, value, duration])

  return (
    <span ref={elementRef} className="font-sans tabular-nums">
      {prefix}
      {currentVal.toFixed(decimals)}
      {suffix}
    </span>
  )
}
