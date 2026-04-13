import Logo from '../Logo'

export default function Footer() {
  return (
    <footer className="relative py-4" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-h)' }}>DeadSwitch</span>
          </div>

          <div className="flex items-center gap-6">
            {['GitHub', 'X Layer', 'Docs'].map((label, i) => (
              <a key={i} href="#" className="text-[10px] font-mono uppercase tracking-[0.15em] no-underline hover:underline" style={{ color: 'var(--text-m)' }}>
                {label}
              </a>
            ))}
          </div>

          <span className="text-[10px] font-mono uppercase tracking-[0.1em]" style={{ color: 'var(--text-m)' }}>
            OKX OnchainOS / Build X S2
          </span>
        </div>
      </div>
    </footer>
  )
}
