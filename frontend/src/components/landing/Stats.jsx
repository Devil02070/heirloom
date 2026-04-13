import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import gsap from 'gsap'

const stats = [
  { value: 140, suffix: 'B+', prefix: '$', label: 'CRYPTO LOST', color: '#FF2D20' },
  { value: 4, suffix: 'M+', prefix: '', label: 'WALLETS ABANDONED', color: 'var(--text-h)' },
  { value: 0, suffix: '', prefix: '', label: 'ON-CHAIN WILLS', color: '#FF2D20' },
  { value: 100, suffix: '%', prefix: '', label: 'NON-CUSTODIAL', color: 'var(--text-h)' },
]

function AnimatedCounter({ value, prefix, suffix, color, inView }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!inView || !ref.current) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: value, duration: 2, ease: 'power2.out',
      onUpdate: () => { if (ref.current) ref.current.textContent = `${prefix}${Math.floor(obj.val)}${suffix}` },
    })
  }, [inView, value, prefix, suffix])
  return <span ref={ref} className="text-4xl md:text-6xl font-black font-mono" style={{ color }}>{prefix}0{suffix}</span>
}

export default function Stats() {
  const containerRef = useRef(null)
  const inView = useInView(containerRef, { once: true, margin: '-100px' })

  return (
    <section className="relative py-20 overflow-hidden" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div ref={containerRef} className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="py-8 px-6"
              style={{ borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}
            >
              <AnimatedCounter {...stat} inView={inView} />
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] mt-3" style={{ color: 'var(--text-m)' }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
