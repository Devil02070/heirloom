import { motion } from 'framer-motion'

const steps = [
  { num: '01', title: 'Configure Your Plan', desc: 'Set your inactivity threshold, add beneficiary wallet addresses, and choose which emergency actions to execute.' },
  { num: '02', title: 'Agent Monitors', desc: 'Our AI agent continuously monitors your wallet activity on-chain. It knows your last transaction timestamp at all times.' },
  { num: '03', title: 'Threshold Reached', desc: 'When inactivity exceeds your configured threshold (or you hit the panic button), the emergency protocol activates.' },
  { num: '04', title: 'Assets Delivered', desc: 'Positions withdrawn, tokens swapped to stablecoins, approvals revoked, and funds transferred to your beneficiaries.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden" style={{ background: 'var(--section-alt)' }}>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
          style={{ borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] block mb-3" style={{ color: '#FF2D20' }}>
            [PROCESS]
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>
            How It Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="p-6 relative"
              style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}
            >
              <span className="text-6xl md:text-7xl font-black font-mono block mb-4" style={{ color: 'var(--border)' }}>
                {step.num}
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3" style={{ color: 'var(--text-h)' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-p)' }}>
                {step.desc}
              </p>
              {i < 3 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                  <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#FF2D20' }}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
