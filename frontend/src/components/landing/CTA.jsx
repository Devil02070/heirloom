import { motion } from 'framer-motion'
import PixelBlastBg from '../PixelBlast'

export default function CTA({ onLaunchApp }) {
  return (
    <section className="relative py-32 overflow-hidden" style={{ background: 'var(--section-alt)' }}>
      <div className="noise absolute inset-0" />
      <div className="absolute inset-0 opacity-30">
        <PixelBlastBg
          variant="diamond"
          pixelSize={10}
          color="#FF2D20"
          speed={0.4}
          patternDensity={0.6}
          edgeFade={0.5}
          enableRipples={false}
          transparent={true}
          antialias={false}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-6 tracking-tight" style={{ color: 'var(--text-h)' }}>
            Don't let your crypto<br />
            <span style={{ color: '#FF2D20' }}>die with you</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-p)' }}>
            Set up your Heirloom in minutes. Your beneficiaries will thank you.
          </p>

          <motion.button
            onClick={onLaunchApp}
            className="group px-10 py-5 text-lg font-bold uppercase tracking-wider text-white cursor-pointer"
            style={{ background: '#FF2D20', border: '1px solid #FF2D20' }}
            whileHover={{ x: -3, y: -3, boxShadow: '6px 6px 0px #000' }}
            whileTap={{ x: 0, y: 0, boxShadow: 'none' }}
          >
            <span className="flex items-center gap-3">
              Get Started Now
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </motion.button>

          <div className="flex items-center justify-center gap-4 mt-8">
            {['NON-CUSTODIAL', 'OPEN SOURCE', 'X LAYER'].map((label, i) => (
              <span key={i} className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--text-m)' }}>
                [{label}]
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
