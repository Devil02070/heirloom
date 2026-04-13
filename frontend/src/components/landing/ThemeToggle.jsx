import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

// Pixel art moon (dark mode)
function PixelMoon({ size = 14 }) {
  const pixels = [
    [3,0],[4,0],[5,0],
    [2,1],[6,1],
    [1,2],[6,2],
    [1,3],[5,3],
    [1,4],[5,4],
    [1,5],[6,5],
    [2,6],[6,6],
    [3,7],[4,7],[5,7],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" style={{ imageRendering: 'pixelated' }}>
      {pixels.map(([x, y], i) => (
        <motion.rect
          key={i} x={x} y={y} width={1} height={1} fill="#fff"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.1 }}
        />
      ))}
    </svg>
  )
}

// Pixel art sun (light mode)
function PixelSun({ size = 14 }) {
  // Rays
  const rays = [[3,0],[7,0],[0,3],[7,3],[0,7],[3,7],[7,7]]
  // Core
  const core = [
    [3,2],[4,2],[5,2],
    [2,3],[3,3],[4,3],[5,3],[6,3],
    [2,4],[3,4],[4,4],[5,4],[6,4],
    [2,5],[3,5],[4,5],[5,5],[6,5],
    [3,6],[4,6],[5,6],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" style={{ imageRendering: 'pixelated' }}>
      {rays.map(([x, y], i) => (
        <motion.rect
          key={`r${i}`} x={x} y={y} width={1} height={1} fill="#000"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
        />
      ))}
      {core.map(([x, y], i) => (
        <motion.rect
          key={`c${i}`} x={x} y={y} width={1} height={1} fill="#000"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.08 }}
        />
      ))}
    </svg>
  )
}

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggle}
      className="relative w-16 h-8 cursor-pointer flex items-center px-1"
      style={{
        background: isDark ? '#111' : '#E8E2DC',
        border: `1px solid ${isDark ? '#333' : '#C4BCB2'}`,
        boxShadow: isDark ? '2px 2px 0px #333' : '2px 2px 0px #C4BCB2',
        transform: 'translate(-1px, -1px)',
      }}
      whileHover={{
        boxShadow: isDark ? '2px 2px 0px #FF2D20' : '2px 2px 0px #FF2D20',
        borderColor: '#FF2D20',
      }}
      whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
      transition={{ duration: 0.15 }}
      aria-label="Toggle theme"
    >
      {/* Track label */}
      <span
        className="absolute text-[7px] font-mono font-bold uppercase tracking-wider"
        style={{
          color: isDark ? '#444' : '#B8B0A5',
          right: isDark ? '6px' : 'auto',
          left: isDark ? 'auto' : '6px',
        }}
      >
        {isDark ? 'DARK' : 'LITE'}
      </span>

      {/* Toggle knob */}
      <motion.div
        className="relative z-10 w-6 h-6 flex items-center justify-center"
        style={{
          background: isDark ? '#FF2D20' : '#FFB800',
        }}
        animate={{ x: isDark ? 0 : 30 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {isDark ? <PixelMoon size={12} /> : <PixelSun size={12} />}
      </motion.div>
    </motion.button>
  )
}
