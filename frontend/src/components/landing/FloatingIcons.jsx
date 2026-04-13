import { motion } from 'framer-motion'

// Pixel art SVG icons — 16x16 grid scaled up
function PixelSkull({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="1" width="8" height="1" fill="#FF2D20"/>
      <rect x="3" y="2" width="1" height="1" fill="#FF2D20"/>
      <rect x="12" y="2" width="1" height="1" fill="#FF2D20"/>
      <rect x="3" y="3" width="10" height="1" fill="#FF2D20"/>
      <rect x="3" y="4" width="2" height="1" fill="#FF2D20"/>
      <rect x="7" y="4" width="2" height="1" fill="#FF2D20"/>
      <rect x="11" y="4" width="2" height="1" fill="#FF2D20"/>
      <rect x="3" y="5" width="10" height="1" fill="#FF2D20"/>
      <rect x="3" y="6" width="1" height="1" fill="#FF2D20"/>
      <rect x="5" y="6" width="1" height="1" fill="#FF2D20"/>
      <rect x="7" y="6" width="2" height="1" fill="#FF2D20"/>
      <rect x="10" y="6" width="1" height="1" fill="#FF2D20"/>
      <rect x="12" y="6" width="1" height="1" fill="#FF2D20"/>
      <rect x="4" y="7" width="8" height="1" fill="#FF2D20"/>
    </svg>
  )
}

function PixelShield({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="1" width="10" height="1" fill="var(--text-m)"/>
      <rect x="2" y="2" width="1" height="1" fill="var(--text-m)"/>
      <rect x="13" y="2" width="1" height="1" fill="var(--text-m)"/>
      <rect x="2" y="3" width="12" height="1" fill="var(--text-m)"/>
      <rect x="3" y="4" width="10" height="1" fill="var(--text-m)"/>
      <rect x="3" y="5" width="10" height="1" fill="var(--text-m)"/>
      <rect x="4" y="6" width="8" height="1" fill="var(--text-m)"/>
      <rect x="4" y="7" width="8" height="1" fill="var(--text-m)"/>
      <rect x="5" y="8" width="6" height="1" fill="var(--text-m)"/>
      <rect x="6" y="9" width="4" height="1" fill="var(--text-m)"/>
      <rect x="7" y="10" width="2" height="1" fill="var(--text-m)"/>
      {/* Checkmark */}
      <rect x="6" y="5" width="1" height="1" fill="#FF2D20"/>
      <rect x="7" y="6" width="1" height="1" fill="#FF2D20"/>
      <rect x="8" y="5" width="1" height="1" fill="#FF2D20"/>
      <rect x="9" y="4" width="1" height="1" fill="#FF2D20"/>
    </svg>
  )
}

function PixelLock({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      <rect x="5" y="2" width="6" height="1" fill="var(--text-m)"/>
      <rect x="4" y="3" width="1" height="3" fill="var(--text-m)"/>
      <rect x="11" y="3" width="1" height="3" fill="var(--text-m)"/>
      <rect x="3" y="6" width="10" height="1" fill="#FF2D20"/>
      <rect x="3" y="7" width="10" height="5" fill="#FF2D20"/>
      <rect x="3" y="12" width="10" height="1" fill="#FF2D20"/>
      {/* Keyhole */}
      <rect x="7" y="8" width="2" height="1" fill="#000"/>
      <rect x="7" y="9" width="2" height="2" fill="#000"/>
    </svg>
  )
}

function PixelCoin({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      <rect x="5" y="2" width="6" height="1" fill="#FFB800"/>
      <rect x="4" y="3" width="1" height="1" fill="#FFB800"/>
      <rect x="11" y="3" width="1" height="1" fill="#FFB800"/>
      <rect x="3" y="4" width="1" height="8" fill="#FFB800"/>
      <rect x="12" y="4" width="1" height="8" fill="#FFB800"/>
      <rect x="4" y="12" width="1" height="1" fill="#FFB800"/>
      <rect x="11" y="12" width="1" height="1" fill="#FFB800"/>
      <rect x="5" y="13" width="6" height="1" fill="#FFB800"/>
      {/* Dollar sign */}
      <rect x="7" y="4" width="2" height="1" fill="#FFB800"/>
      <rect x="6" y="5" width="1" height="1" fill="#FFB800"/>
      <rect x="7" y="6" width="2" height="1" fill="#FFB800"/>
      <rect x="9" y="7" width="1" height="1" fill="#FFB800"/>
      <rect x="6" y="8" width="3" height="1" fill="#FFB800"/>
      <rect x="6" y="9" width="1" height="1" fill="#FFB800"/>
      <rect x="7" y="10" width="2" height="1" fill="#FFB800"/>
    </svg>
  )
}

function PixelHeart({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="4" width="2" height="1" fill="#FF2D20"/>
      <rect x="8" y="4" width="2" height="1" fill="#FF2D20"/>
      <rect x="1" y="5" width="5" height="1" fill="#FF2D20"/>
      <rect x="7" y="5" width="5" height="1" fill="#FF2D20"/>
      <rect x="1" y="6" width="11" height="1" fill="#FF2D20"/>
      <rect x="2" y="7" width="9" height="1" fill="#FF2D20"/>
      <rect x="3" y="8" width="7" height="1" fill="#FF2D20"/>
      <rect x="4" y="9" width="5" height="1" fill="#FF2D20"/>
      <rect x="5" y="10" width="3" height="1" fill="#FF2D20"/>
      <rect x="6" y="11" width="1" height="1" fill="#FF2D20"/>
    </svg>
  )
}

function PixelBolt({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      <rect x="8" y="1" width="2" height="1" fill="#FFB800"/>
      <rect x="7" y="2" width="2" height="1" fill="#FFB800"/>
      <rect x="6" y="3" width="2" height="1" fill="#FFB800"/>
      <rect x="5" y="4" width="2" height="1" fill="#FFB800"/>
      <rect x="4" y="5" width="2" height="1" fill="#FFB800"/>
      <rect x="3" y="6" width="7" height="1" fill="#FFB800"/>
      <rect x="7" y="7" width="2" height="1" fill="#FFB800"/>
      <rect x="6" y="8" width="2" height="1" fill="#FFB800"/>
      <rect x="5" y="9" width="2" height="1" fill="#FFB800"/>
      <rect x="4" y="10" width="2" height="1" fill="#FFB800"/>
      <rect x="3" y="11" width="2" height="1" fill="#FFB800"/>
    </svg>
  )
}

const icons = [
  { Icon: PixelSkull, x: '6%', y: '15%', size: 110, duration: 5, delay: 0, rotate: [-8, 8] },
  { Icon: PixelShield, x: '88%', y: '42%', size: 96, duration: 6, delay: 0.5, rotate: [5, -5] },
  { Icon: PixelLock, x: '12%', y: '55%', size: 90, duration: 7, delay: 1, rotate: [-5, 10] },
  { Icon: PixelCoin, x: '84%', y: '60%', size: 100, duration: 5.5, delay: 0.3, rotate: [10, -10] },
  { Icon: PixelHeart, x: '4%', y: '80%', size: 92, duration: 6.5, delay: 0.8, rotate: [-12, 6] },
  { Icon: PixelBolt, x: '91%', y: '78%', size: 96, duration: 5, delay: 0.2, rotate: [6, -8] },
  { Icon: PixelSkull, x: '76%', y: '38%', size: 80, duration: 7, delay: 1.2, rotate: [-4, 4] },
  { Icon: PixelCoin, x: '18%', y: '35%', size: 85, duration: 6, delay: 0.7, rotate: [8, -6] },
  { Icon: PixelBolt, x: '50%', y: '85%', size: 88, duration: 5.5, delay: 0.4, rotate: [-6, 12] },
  { Icon: PixelLock, x: '66%', y: '45%', size: 76, duration: 7.5, delay: 1.5, rotate: [4, -4] },
]

export default function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
      {icons.map(({ Icon, x, y, size, duration, delay, rotate }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: x, top: y, opacity: 0.35 }}
          animate={{
            y: [0, -22, 0, 16, 0],
            rotate: [rotate[0], rotate[1], rotate[0]],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}
    </div>
  )
}
