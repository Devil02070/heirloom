import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function TextRevealCursor({
  children,
  revealColor = '#FF2D20',
  bgColor = 'var(--surface)',
  cursorSize = 120,
  className = '',
  style = {},
}) {
  const containerRef = useRef(null)
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative cursor-none ${className}`}
      style={{ ...style, overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setPos({ x: -200, y: -200 }) }}
    >
      {/* Base text — original color */}
      <div className="relative z-10 pointer-events-none">
        {children}
      </div>

      {/* Reveal layer — clipped circle showing different color text */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          clipPath: `circle(${cursorSize / 2}px at ${pos.x}px ${pos.y}px)`,
          backgroundColor: revealColor,
        }}
        animate={{
          clipPath: isHovering
            ? `circle(${cursorSize / 2}px at ${pos.x}px ${pos.y}px)`
            : `circle(0px at ${pos.x}px ${pos.y}px)`,
        }}
        transition={{ type: 'tween', duration: 0.05, ease: 'linear' }}
      >
        {/* Duplicate text in contrasting color */}
        <div style={{ color: '#000' }}>
          {children}
        </div>
      </motion.div>

      {/* Cursor ring */}
      {isHovering && (
        <div
          className="absolute z-30 pointer-events-none border-2 rounded-full"
          style={{
            width: cursorSize,
            height: cursorSize,
            left: pos.x - cursorSize / 2,
            top: pos.y - cursorSize / 2,
            borderColor: 'rgba(255,255,255,0.3)',
            transition: 'width 0.2s, height 0.2s',
          }}
        />
      )}
    </div>
  )
}
