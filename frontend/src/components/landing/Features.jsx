import { motion } from 'framer-motion'

const features = [
  { num: '01', title: "Dead Man's Switch", desc: 'Configure an inactivity timeout. If your wallet goes silent, the protocol wakes up and executes your plan.' },
  { num: '02', title: 'Panic Button', desc: 'One click to liquidate everything. Exit all DeFi positions, swap to stables, transfer to your beneficiaries.' },
  { num: '03', title: 'DeFi Position Scanner', desc: 'Automatically discovers all your LP positions, lending, staking, and yield farming across every protocol.' },
  { num: '04', title: 'Smart Liquidation', desc: 'Uses DEX aggregation to find optimal swap routes. Minimizes slippage for your beneficiaries.' },
  { num: '05', title: 'Multi-Beneficiary', desc: 'Split assets across multiple recipients with custom allocation percentages. Your crypto, your rules.' },
  { num: '06', title: 'Approval Cleanup', desc: 'Automatically revokes unnecessary token approvals after execution, securing the wallet from exploits.' },
]

export default function Features() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
          style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-3" style={{ color: '#FF2D20' }}>
                [FEATURES]
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>
                Protect Your<br />Legacy
              </h2>
            </div>
            <span className="text-6xl md:text-8xl font-black" style={{ color: 'var(--border)' }}>06</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-6 group cursor-default transition-colors"
              style={{
                borderRight: (i % 3 !== 2) ? '1px solid var(--border)' : 'none',
                borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
              }}
              whileHover={{ backgroundColor: 'var(--surface-2)' }}
            >
              <span className="text-4xl font-black font-mono block mb-4" style={{ color: 'var(--border-strong)' }}>
                {f.num}
              </span>
              <h3 className="text-base font-black uppercase tracking-tight mb-2" style={{ color: 'var(--text-h)' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-p)' }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
