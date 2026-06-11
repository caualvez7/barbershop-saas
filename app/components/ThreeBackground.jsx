'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const containerRef = useRef(null)
  const requestRef = useRef(null)
  
  // Track mouse coordinates
  const mouseX = useRef(0)
  const mouseY = useRef(0)
  const targetMouseX = useRef(0)
  const targetMouseY = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return

    // Screen dimensions
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    // 1. Scene setup
    const scene = new THREE.Scene()

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.z = 40
    camera.position.y = 10

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)

    // 4. Particles creation (glowing golden dust)
    const particleCount = 1200
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const initialPositions = [] // Store for math wave calculations

    for (let i = 0; i < particleCount; i++) {
      // Create a grid/wave structure spread across X and Z
      const x = (Math.random() - 0.5) * 80
      const z = (Math.random() - 0.5) * 80
      const y = (Math.sin(x * 0.15) * Math.cos(z * 0.15)) * 2 + (Math.random() - 0.5) * 2

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      initialPositions.push({ x, y, z, seed: Math.random() * 100 })
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Particle texture - create a simple canvas radial gradient to act as a soft circle
    const createCircleTexture = () => {
      const matCanvas = document.createElement('canvas')
      matCanvas.width = 16
      matCanvas.height = 16
      const matContext = matCanvas.getContext('2d')
      const gradient = matContext.createRadialGradient(8, 8, 0, 8, 8, 8)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.2, 'rgba(245, 158, 11, 0.8)')
      gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      matContext.fillStyle = gradient
      matContext.fillRect(0, 0, 16, 16)
      
      const texture = new THREE.CanvasTexture(matCanvas)
      return texture
    }

    const material = new THREE.PointsMaterial({
      color: 0xf59e0b, // Gold
      size: 0.35,
      map: createCircleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const particleSystem = new THREE.Points(geometry, material)
    scene.add(particleSystem)

    // 5. Light (subtle golden ambient light)
    const ambientLight = new THREE.AmbientLight(0xd4af37, 0.5)
    scene.add(ambientLight)

    // Mouse movement event listener
    const onMouseMove = (event) => {
      // Normalize mouse positions between -1 and 1
      targetMouseX.current = (event.clientX / window.innerWidth) * 2 - 1
      targetMouseY.current = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', onMouseMove)

    // Resize handler
    const onResize = () => {
      if (!containerRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', onResize)

    // 6. Animation loop
    let clock = new THREE.Clock()

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()
      const positionAttr = geometry.attributes.position

      // Wave calculation for particles
      for (let i = 0; i < particleCount; i++) {
        const init = initialPositions[i]
        
        // Dynamic waving motion using math sin/cos
        const newY = init.y + 
                     Math.sin(elapsedTime * 1.2 + init.x * 0.12 + init.seed) * 1.2 + 
                     Math.cos(elapsedTime * 0.8 + init.z * 0.08) * 0.8

        positionAttr.setY(i, newY)
      }
      
      positionAttr.needsUpdate = true

      // Slow idle rotation of particle system
      particleSystem.rotation.y = elapsedTime * 0.02
      
      // Interpolate/ease mouse movements for smooth camera reactivity
      mouseX.current += (targetMouseX.current - mouseX.current) * 0.05
      mouseY.current += (targetMouseY.current - mouseY.current) * 0.05

      // Move camera slightly based on mouse
      camera.position.x = mouseX.current * 10
      camera.position.y = 10 + (mouseY.current * 6)
      camera.lookAt(new THREE.Vector3(0, 0, 0))

      renderer.render(scene, camera)
      
      requestRef.current = requestAnimationFrame(animate)
    }

    animate()

    // 7. Cleanup on unmount
    return () => {
      cancelAnimationFrame(requestRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      
      if (containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement)
        } catch (e) {
          // Element might have been removed already
        }
      }

      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none -z-15 overflow-hidden bg-transparent"
      style={{ opacity: 0.7 }}
    />
  )
}
