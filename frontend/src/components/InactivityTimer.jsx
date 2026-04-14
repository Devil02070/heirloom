import { useState } from 'react'
import { motion } from 'framer-motion'

export default function InactivityTimer({
  daysSince = 0,
  threshold = 30,
  status = 'ACTIVE',
  lastActivityAt = null,
  isLive = false,
  onSimulate = null,
}) {
  const [simOpen, setSimOpen] = useState(false)
  const [simDays, setSimDays] = useState(daysSince)
  const percent = Math.min((daysSince / Math.max(threshold, 1)) * 100, 100)

  const statusConfig = {
    ACTIVE: { color: '#22C55E', label: 'ACTIVE' },
    WARNING: { color: '#FFB800', label: 'WARNING' },
    TRIGGERED: { color: '#FF2D20', label: 'TRIGGERED' },
  }

  const config = statusConfig[status] || statusConfig.ACTIVE

  const lastActivityLabel = lastActivityAt
    ? new Date(lastActivityAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : '—'

  return (
    <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-h)' }}>
            Inactivity Monitor
          </h3>
          {isLive && (
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.1em] px-2 py-0.5 flex items-center gap-1.5" style={{ border: '1px solid #22C55E', color: '#22C55E' }}>
              <span className="w-1.5 h-1.5 bg-success" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onSimulate && (
            <button
              onClick={() => setSimOpen(!simOpen)}
              className="text-[9px] font-mono font-bold uppercase tracking-[0.1em] px-2 py-1 cursor-pointer border-none"
              style={{ border: '1px solid var(--border)', color: 'var(--text-m)', background: 'transparent' }}
              title="Simulate inactivity for demo"
            >
              {simOpen ? '× Close' : 'Demo'}
            </button>
          )}
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] px-3 py-1" style={{ color: config.color, border: `1px solid ${config.color}` }}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Live last-activity label */}
      {isLive && (
        <div className="mb-4 text-[10px] font-mono" style={{ color: 'var(--text-m)' }}>
          <span>LAST TX OBSERVED: </span>
          <span style={{ color: 'var(--text-p)' }}>{lastActivityLabel}</span>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-mono mb-2" style={{ color: 'var(--text-m)' }}>
          <span>INACTIVE: {daysSince}D</span>
          <span>THRESHOLD: {threshold}D</span>
        </div>
        <div className="w-full h-3" style={{ background: 'var(--surface-3)' }}>
          <motion.div
            className="h-3"
            style={{ background: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        {[
          { val: daysSince, label: 'DAYS INACTIVE' },
          { val: threshold, label: 'THRESHOLD' },
          { val: Math.max(threshold - daysSince, 0), label: 'DAYS LEFT' },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-2xl font-black font-mono" style={{ color: 'var(--text-h)' }}>{item.val}</p>
            <p className="text-[9px] font-mono uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--text-m)' }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Demo simulator */}
      {simOpen && onSimulate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4"
          style={{ border: '1px dashed var(--border)', background: 'var(--surface-2)' }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-m)' }}>
            DEMO MODE — simulate wallet inactivity
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={Math.max(threshold + 10, 60)}
              value={simDays}
              onChange={(e) => setSimDays(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-mono font-bold" style={{ color: 'var(--text-h)', minWidth: '60px' }}>
              {simDays}d
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onSimulate(simDays)}
              className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase cursor-pointer border-none"
              style={{ background: config.color, color: '#000' }}
            >
              Apply
            </button>
            <button
              onClick={() => { onSimulate(null); setSimDays(0); setSimOpen(false) }}
              className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase cursor-pointer border-none"
              style={{ border: '1px solid var(--border)', color: 'var(--text-p)', background: 'transparent' }}
            >
              Reset to Live
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
