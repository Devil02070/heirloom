import { motion } from 'framer-motion'

/* ── Shield Vault — Hero illustration ── */
export function ShieldVault({ className = '' }) {
  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer glow */}
      <defs>
        <radialGradient id="vault-glow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shield-grad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#A18AFF" />
        </linearGradient>
        <linearGradient id="lock-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#6C63FF" />
        </linearGradient>
        <filter id="neon-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx="200" cy="200" r="180" fill="url(#vault-glow)" />

      {/* Orbiting rings */}
      <motion.ellipse
        cx="200" cy="220" rx="160" ry="50"
        stroke="#6C63FF" strokeWidth="0.5" fill="none" strokeOpacity="0.2"
        strokeDasharray="8 4"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
        style={{ transformOrigin: '200px 220px' }}
      />
      <motion.ellipse
        cx="200" cy="220" rx="140" ry="90"
        stroke="#00F0FF" strokeWidth="0.5" fill="none" strokeOpacity="0.15"
        strokeDasharray="4 8"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        style={{ transformOrigin: '200px 220px' }}
      />

      {/* Shield body */}
      <motion.path
        d="M200 60 L320 120 L320 240 C320 320 260 380 200 400 C140 380 80 320 80 240 L80 120 Z"
        fill="rgba(10, 11, 26, 0.8)"
        stroke="url(#shield-grad)"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />

      {/* Inner shield face */}
      <path
        d="M200 85 L300 135 L300 235 C300 305 250 355 200 375 C150 355 100 305 100 235 L100 135 Z"
        fill="rgba(108, 99, 255, 0.05)"
        stroke="rgba(108, 99, 255, 0.15)"
        strokeWidth="1"
      />

      {/* Lock body */}
      <rect x="165" y="200" width="70" height="55" rx="8" fill="rgba(10, 11, 26, 0.9)" stroke="url(#lock-grad)" strokeWidth="1.5" filter="url(#neon-glow)" />

      {/* Lock shackle */}
      <motion.path
        d="M178 200 V185 C178 165 222 165 222 185 V200"
        fill="none" stroke="url(#lock-grad)" strokeWidth="3" strokeLinecap="round"
        filter="url(#neon-glow)"
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      />

      {/* Keyhole */}
      <circle cx="200" cy="220" r="6" fill="#00F0FF" filter="url(#neon-glow)">
        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <rect x="197" y="224" width="6" height="12" rx="1" fill="#00F0FF" filter="url(#neon-glow)" />

      {/* Pixel data particles */}
      {[
        { x: 120, y: 150, delay: 0 }, { x: 280, y: 160, delay: 0.5 },
        { x: 140, y: 280, delay: 1 }, { x: 260, y: 300, delay: 1.5 },
        { x: 100, y: 220, delay: 0.8 }, { x: 300, y: 240, delay: 1.2 },
      ].map((p, i) => (
        <motion.rect
          key={i} x={p.x} y={p.y} width="4" height="4" rx="0.5"
          fill="#00F0FF" opacity="0.6"
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Horizontal scan line */}
      <motion.line
        x1="90" y1="250" x2="310" y2="250"
        stroke="#6C63FF" strokeWidth="1" strokeOpacity="0.3"
        animate={{ y1: [120, 350, 120], y2: [120, 350, 120] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      />
    </svg>
  )
}

/* ── Network Nodes — How it works illustration ── */
export function NetworkNodes({ className = '' }) {
  return (
    <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="node-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Connection lines */}
      {[
        [60,100,150,60], [150,60,240,100], [60,100,150,140],
        [150,140,240,100], [150,60,150,140],
      ].map(([x1,y1,x2,y2], i) => (
        <motion.line
          key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#6C63FF" strokeWidth="1" strokeOpacity="0.3"
          strokeDasharray="4 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: i * 0.2 }}
        />
      ))}

      {/* Nodes */}
      {[
        { cx: 60, cy: 100, r: 14, color: '#6C63FF', label: 'W' },
        { cx: 150, cy: 60, r: 18, color: '#00F0FF', label: 'A' },
        { cx: 240, cy: 100, r: 14, color: '#FF2D55', label: 'B' },
        { cx: 150, cy: 140, r: 14, color: '#00F0A0', label: 'B' },
      ].map((node, i) => (
        <g key={i}>
          <motion.circle
            cx={node.cx} cy={node.cy} r={node.r + 6}
            fill="none" stroke={node.color} strokeWidth="0.5" strokeOpacity="0.3"
            animate={{ r: [node.r + 6, node.r + 12, node.r + 6] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
          />
          <circle cx={node.cx} cy={node.cy} r={node.r} fill="rgba(10,11,26,0.9)" stroke={node.color} strokeWidth="1.5" filter="url(#node-glow)" />
          <text x={node.cx} y={node.cy + 4} textAnchor="middle" fill={node.color} fontSize="10" fontFamily="JetBrains Mono" fontWeight="600">{node.label}</text>
        </g>
      ))}

      {/* Animated data packets along lines */}
      <motion.circle r="2" fill="#00F0FF"
        animate={{ cx: [60, 150], cy: [100, 60] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
      />
      <motion.circle r="2" fill="#FF2D55"
        animate={{ cx: [150, 240], cy: [60, 100] }}
        transition={{ repeat: Infinity, duration: 2, delay: 1, ease: 'linear' }}
      />
    </svg>
  )
}

/* ── Heartbeat Monitor — Status illustration ── */
export function HeartbeatMonitor({ className = '', active = true }) {
  const pathActive = "M0,30 L20,30 L25,30 L30,10 L35,50 L40,20 L45,35 L50,30 L70,30 L75,30 L80,10 L85,50 L90,20 L95,35 L100,30 L120,30"
  const pathDead = "M0,30 L120,30"

  return (
    <svg viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="ecg-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <motion.path
        d={active ? pathActive : pathDead}
        stroke={active ? '#00F0A0' : '#FF2D55'}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        filter="url(#ecg-glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  )
}

/* ── Skull / Danger — CTA illustration ── */
export function DangerSkull({ className = '' }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <filter id="skull-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Skull outline */}
      <motion.path
        d="M60 20 C35 20 20 40 20 60 C20 75 28 85 35 90 L35 100 L50 100 L50 95 L55 100 L65 100 L70 95 L70 100 L85 100 L85 90 C92 85 100 75 100 60 C100 40 85 20 60 20Z"
        fill="none"
        stroke="#FF2D55"
        strokeWidth="1.5"
        filter="url(#skull-glow)"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />
      {/* Eyes */}
      <motion.ellipse cx="45" cy="55" rx="10" ry="12" fill="none" stroke="#FF006E" strokeWidth="1.5"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0 }}
        style={{ transformOrigin: '45px 55px' }}
      />
      <motion.ellipse cx="75" cy="55" rx="10" ry="12" fill="none" stroke="#FF006E" strokeWidth="1.5"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
        style={{ transformOrigin: '75px 55px' }}
      />
      {/* Eye dots */}
      <circle cx="45" cy="55" r="3" fill="#FF2D55" filter="url(#skull-glow)">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="75" cy="55" r="3" fill="#FF2D55" filter="url(#skull-glow)">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
      </circle>
      {/* Nose */}
      <path d="M56 68 L60 73 L64 68" stroke="#FF2D55" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  )
}

/* ── Animated Pixel Particles background ── */
export function PixelParticles({ count = 30, className = '' }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 3,
    color: ['#6C63FF', '#00F0FF', '#A18AFF', '#FF2D55', '#00F0A0'][Math.floor(Math.random() * 5)],
  }))

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.size > 2 ? '0px' : '50%',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -30, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
