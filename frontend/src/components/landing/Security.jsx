import { motion } from 'framer-motion'

const badges = [
  { title: 'Non-Custodial', desc: 'Your keys, your crypto. We never hold or control your assets.' },
  { title: 'On-Chain Verification', desc: 'Every action is executed and verifiable on X Layer blockchain.' },
  { title: 'Open Source', desc: 'Fully transparent codebase. Audit it yourself on GitHub.' },
  { title: 'AI-Powered Agent', desc: 'Intelligent execution using OKX OnchainOS skills for optimal results.' },
]

export default function Security() {
  return (
    <section id="security" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
          style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-3" style={{ color: '#FF2D20' }}>
            [SECURITY]
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>
            Trustless By Design
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {badges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 group"
              style={{
                borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              }}
              whileHover={{ backgroundColor: 'var(--surface-2)' }}
            >
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] block mb-3" style={{ color: 'var(--text-m)' }}>
                0{i + 1}
              </span>
              <h3 className="text-base font-black uppercase tracking-tight mb-2" style={{ color: 'var(--text-h)' }}>
                {badge.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-p)' }}>{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
