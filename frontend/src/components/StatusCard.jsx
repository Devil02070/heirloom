import { useState } from 'react'
import { motion } from 'framer-motion'
import PixelBlast from './PixelBlast'

const variantStyles = {
  default: { border: 'var(--border)', bg: 'var(--card-bg)', pixelColor: '#FF2D20' },
  success: { border: '#22C55E', bg: 'var(--card-bg)', pixelColor: '#22C55E' },
  warning: { border: '#FFB800', bg: 'var(--card-bg)', pixelColor: '#FFB800' },
  danger: { border: '#FF2D20', bg: 'var(--card-bg)', pixelColor: '#FF2D20' },
}

const iconStyles = {
  default: { color: 'var(--text-p)', bg: 'var(--surface-3)' },
  success: { color: '#22C55E', bg: 'var(--surface-3)' },
  warning: { color: '#FFB800', bg: 'var(--surface-3)' },
  danger: { color: '#FF2D20', bg: 'var(--surface-3)' },
}

export default function StatusCard({ title, value, subtitle, icon, variant = 'default' }) {
  const v = variantStyles[variant]
  const ic = iconStyles[variant]
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      className="p-5 relative overflow-hidden"
      style={{ border: `1px solid ${v.border}`, background: v.bg }}
      whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px rgba(255, 45, 32, 0.35)' }}
      whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
      transition={{ duration: 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* PixelBlast on hover */}
      {hovered && (
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <PixelBlast
            variant="square"
            pixelSize={3}
            color={v.pixelColor}
            speed={1}
            patternScale={4}
            patternDensity={0.8}
            edgeFade={0.15}
            enableRipples={false}
            transparent={true}
            antialias={false}
          />
        </motion.div>
      )}

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] font-bold" style={{ color: 'var(--text-m)' }}>{title}</p>
          <p className="text-2xl font-black mt-1" style={{ color: 'var(--text-h)' }}>{value}</p>
          {subtitle && <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-m)' }}>{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 flex items-center justify-center" style={{ background: ic.bg, color: ic.color }}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
