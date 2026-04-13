import { motion } from 'framer-motion'

const PX = { imageRendering: 'pixelated' }

// Staggered pixel appear animation
const pxVar = {
  hidden: { opacity: 0 },
  show: (i) => ({
    opacity: 1,
    transition: { delay: i * 0.04, duration: 0.1 }
  }),
}

// Continuous shimmer: pixels pulse in sequence
function AnimPixel({ x, y, size, fill, i = 0 }) {
  return (
    <motion.rect
      x={x} y={y} width={size} height={size} fill={fill}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 2, delay: i * 0.15, ease: 'easeInOut' }}
    />
  )
}

// ── DASHBOARD ICON (4 squares grid)
export function PixelDashboardIcon({ size = 16, color = 'currentColor', active = false }) {
  const s = size / 16
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={PX}>
      <AnimPixel x={1} y={1} size={6} fill={color} i={0} />
      <AnimPixel x={9} y={1} size={6} fill={color} i={1} />
      <AnimPixel x={1} y={9} size={6} fill={color} i={2} />
      <AnimPixel x={9} y={9} size={6} fill={color} i={3} />
    </svg>
  )
}

// ── CONFIGURE ICON (gear/cog)
export function PixelConfigIcon({ size = 16, color = 'currentColor' }) {
  const pixels = [
    [6,0],[8,0],
    [6,1],[8,1],
    [4,2],[5,2],[6,2],[8,2],[9,2],[10,2],
    [2,4],[3,4],[4,4],[5,4],[6,4],[8,4],[9,4],[10,4],[11,4],[12,4],
    [2,5],[5,5],[9,5],[12,5],
    [0,6],[1,6],[2,6],[5,6],[9,6],[12,6],[13,6],[14,6],
    [0,8],[1,8],[2,8],[5,8],[9,8],[12,8],[13,8],[14,8],
    [2,9],[5,9],[9,9],[12,9],
    [2,10],[3,10],[4,10],[5,10],[6,10],[8,10],[9,10],[10,10],[11,10],[12,10],
    [4,12],[5,12],[6,12],[8,12],[9,12],[10,12],
    [6,13],[8,13],
    [6,14],[8,14],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={PX}>
      {pixels.map(([x, y], i) => (
        <AnimPixel key={i} x={x} y={y} size={1} fill={color} i={i % 8} />
      ))}
      {/* Center hole */}
      <motion.rect x={6} y={6} width={3} height={3} fill={color}
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    </svg>
  )
}

// ── HISTORY ICON (clock)
export function PixelHistoryIcon({ size = 16, color = 'currentColor' }) {
  // Circle outline pixels
  const circle = [
    [5,0],[6,0],[7,0],[8,0],[9,0],
    [3,1],[4,1],[10,1],[11,1],
    [2,2],[12,2],
    [1,3],[13,3],
    [1,4],[13,4],
    [0,5],[14,5],
    [0,6],[14,6],
    [0,7],[14,7],
    [0,8],[14,8],
    [0,9],[14,9],
    [1,10],[13,10],
    [1,11],[13,11],
    [2,12],[12,12],
    [3,13],[4,13],[10,13],[11,13],
    [5,14],[6,14],[7,14],[8,14],[9,14],
  ]
  // Clock hands
  const hands = [
    [7,4],[7,5],[7,6],[7,7], // vertical
    [8,7],[9,7],[10,7], // horizontal
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={PX}>
      {circle.map(([x, y], i) => (
        <AnimPixel key={`c${i}`} x={x} y={y} size={1} fill={color} i={i % 10} />
      ))}
      {hands.map(([x, y], i) => (
        <motion.rect key={`h${i}`} x={x} y={y} width={1} height={1} fill={color}
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
        />
      ))}
    </svg>
  )
}

// ── DOLLAR / MONEY ICON
export function PixelMoneyIcon({ size = 20, color = 'currentColor' }) {
  const pixels = [
    [4,1],[5,1],[6,1],[7,1],[8,1],
    [3,2],[9,2],
    [2,3],[3,3],
    [3,4],[4,4],[5,4],
    [5,5],[6,5],[7,5],
    [7,6],[8,6],[9,6],
    [9,7],[10,7],
    [3,8],[9,8],[10,8],
    [4,9],[5,9],[6,9],[7,9],[8,9],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 13 11" fill="none" style={PX}>
      {pixels.map(([x, y], i) => (
        <AnimPixel key={i} x={x} y={y} size={1} fill={color} i={i % 6} />
      ))}
      {/* Center line */}
      <motion.rect x={6} y={0} width={1} height={11} fill={color} opacity={0.4}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
    </svg>
  )
}

// ── CHART / TRENDING ICON
export function PixelChartIcon({ size = 20, color = 'currentColor' }) {
  // Bars
  const bars = [
    { x: 1, h: 4, delay: 0 },
    { x: 4, h: 6, delay: 0.2 },
    { x: 7, h: 3, delay: 0.4 },
    { x: 10, h: 8, delay: 0.6 },
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 14 10" fill="none" style={PX}>
      {bars.map((bar, i) => (
        <motion.rect
          key={i}
          x={bar.x} y={10 - bar.h} width={2} height={bar.h} fill={color}
          animate={{ height: [bar.h, bar.h + 1, bar.h - 1, bar.h], y: [10 - bar.h, 10 - bar.h - 1, 10 - bar.h + 1, 10 - bar.h] }}
          transition={{ repeat: Infinity, duration: 2, delay: bar.delay, ease: 'easeInOut' }}
        />
      ))}
      {/* Baseline */}
      <rect x={0} y={9} width={14} height={1} fill={color} opacity={0.3} />
    </svg>
  )
}

// ── USERS / PEOPLE ICON
export function PixelUsersIcon({ size = 20, color = 'currentColor' }) {
  // Person 1
  const p1 = [[4,1],[5,1],[4,2],[5,2],[3,3],[4,3],[5,3],[6,3],[4,4],[5,4],[4,5],[5,5]]
  // Person 2
  const p2 = [[9,2],[10,2],[9,3],[10,3],[8,4],[9,4],[10,4],[11,4],[9,5],[10,5],[9,6],[10,6]]
  return (
    <svg width={size} height={size} viewBox="0 0 14 8" fill="none" style={PX}>
      {p1.map(([x, y], i) => (
        <AnimPixel key={`a${i}`} x={x} y={y} size={1} fill={color} i={i % 5} />
      ))}
      {p2.map(([x, y], i) => (
        <AnimPixel key={`b${i}`} x={x} y={y} size={1} fill={color} i={(i + 3) % 5} />
      ))}
    </svg>
  )
}

// ── SHIELD ICON
export function PixelShieldIcon({ size = 20, color = 'currentColor' }) {
  const shield = [
    [4,0],[5,0],[6,0],[7,0],[8,0],
    [3,1],[9,1],
    [2,2],[10,2],
    [2,3],[10,3],
    [2,4],[10,4],
    [3,5],[9,5],
    [3,6],[9,6],
    [4,7],[8,7],
    [5,8],[7,8],
    [6,9],
  ]
  // Check mark
  const check = [[4,4],[5,5],[6,4],[7,3],[8,2]]
  return (
    <svg width={size} height={size} viewBox="0 0 13 10" fill="none" style={PX}>
      {shield.map(([x, y], i) => (
        <AnimPixel key={`s${i}`} x={x} y={y} size={1} fill={color} i={i % 8} />
      ))}
      {check.map(([x, y], i) => (
        <motion.rect key={`c${i}`} x={x} y={y} width={1} height={1} fill={color}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }}
        />
      ))}
    </svg>
  )
}

// ── ARROW RIGHT
export function PixelArrowIcon({ size = 20, color = 'currentColor' }) {
  const pixels = [
    [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
    [5,1],[5,2],[5,4],[5,5],
    [6,2],[6,4],
    [7,3],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 8 7" fill="none" style={PX}>
      {pixels.map(([x, y], i) => (
        <motion.rect key={i} x={x} y={y} width={1} height={1} fill={color}
          animate={{ x: [x, x + 0.3, x] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.05, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  )
}

// ── WALLET ICON
export function PixelWalletIcon({ size = 20, color = 'currentColor' }) {
  const pixels = [
    [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],
    [1,2],[9,2],
    [1,3],[9,3],[10,3],[11,3],
    [1,4],[11,4],
    [1,5],[9,5],[10,5],[11,5],
    [1,6],[9,6],
    [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],
  ]
  // Clasp
  const clasp = [[9,4],[10,4]]
  return (
    <svg width={size} height={size} viewBox="0 0 12 9" fill="none" style={PX}>
      {pixels.map(([x, y], i) => (
        <AnimPixel key={`w${i}`} x={x} y={y} size={1} fill={color} i={i % 7} />
      ))}
      {clasp.map(([x, y], i) => (
        <motion.rect key={`cl${i}`} x={x} y={y} width={1} height={1} fill={color}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      ))}
    </svg>
  )
}

// ── TRANSACTIONS / SWAP ICON
export function PixelSwapIcon({ size = 20, color = 'currentColor' }) {
  // Arrow right
  const top = [[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[6,1],[6,3],[7,2]]
  // Arrow left
  const bot = [[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[1,4],[1,6],[0,5]]
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="none" style={PX}>
      {top.map(([x, y], i) => (
        <motion.rect key={`t${i}`} x={x} y={y} width={1} height={1} fill={color}
          animate={{ x: [x, x + 0.5, x] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.06 }}
        />
      ))}
      {bot.map(([x, y], i) => (
        <motion.rect key={`b${i}`} x={x} y={y} width={1} height={1} fill={color}
          animate={{ x: [x, x - 0.5, x] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.06 }}
        />
      ))}
    </svg>
  )
}
