import { motion } from 'framer-motion'

export default function InactivityTimer({ daysSince = 0, threshold = 30, status = 'ACTIVE' }) {
  const percent = Math.min((daysSince / threshold) * 100, 100)

  const statusConfig = {
    ACTIVE: { color: '#22C55E', label: 'ACTIVE' },
    WARNING: { color: '#FFB800', label: 'WARNING' },
    TRIGGERED: { color: '#FF2D20', label: 'TRIGGERED' },
  }

  const config = statusConfig[status] || statusConfig.ACTIVE

  return (
    <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-h)' }}>Inactivity Monitor</h3>
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] px-3 py-1" style={{ color: config.color, border: `1px solid ${config.color}` }}>
          {config.label}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-mono mb-2" style={{ color: 'var(--text-m)' }}>
          <span>LAST ACTIVITY: {daysSince}D AGO</span>
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
    </div>
  )
}
