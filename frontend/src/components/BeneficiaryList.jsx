import { motion } from 'framer-motion'

export default function BeneficiaryList({ beneficiaries = [] }) {
  if (beneficiaries.length === 0) {
    return (
      <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <h3 className="text-sm font-black uppercase tracking-wider mb-2" style={{ color: 'var(--text-h)' }}>Beneficiaries</h3>
        <p className="text-xs font-mono" style={{ color: 'var(--text-m)' }}>No beneficiaries configured. Go to Configure to add them.</p>
      </div>
    )
  }

  return (
    <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
      <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: 'var(--text-h)' }}>Beneficiaries</h3>
      <div className="space-y-2">
        {beneficiaries.map((b, i) => (
          <motion.div
            key={i}
            className="flex items-center justify-between p-3"
            style={{ border: '1px solid var(--border)' }}
            whileHover={{ x: 4, borderColor: 'var(--border-strong)' }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-xs font-black font-mono" style={{ background: 'var(--surface-3)', color: 'var(--text-h)' }}>
                {b.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-xs font-bold uppercase" style={{ color: 'var(--text-h)' }}>{b.name}</p>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-m)' }}>{b.address.slice(0, 6)}...{b.address.slice(-4)}</p>
              </div>
            </div>
            <span className="text-sm font-black font-mono" style={{ color: '#FF2D20' }}>{b.allocationPercent}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
