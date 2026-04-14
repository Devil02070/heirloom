import { motion } from 'framer-motion'
import { useWallet } from '../context/WalletContext'
import PixelBlast from './PixelBlast'
import ThemeToggle from './landing/ThemeToggle'
import Logo from './Logo'
import { PixelDashboardIcon, PixelConfigIcon, PixelHistoryIcon } from './PixelIcons'

const nav = [
  { id: 'dashboard', label: 'DASHBOARD', icon: DashboardIcon },
  { id: 'configure', label: 'CONFIGURE', icon: ConfigIcon },
  { id: 'history', label: 'HISTORY', icon: HistoryIcon },
]

export default function Sidebar({ activePage, onNavigate, onGoHome, onConnectWallet, onDisconnect }) {
  const { isConnected, address, shortAddress, balance, nativeBalanceUSD, chainInfo, providerName, walletInfo, totalValueUSD } = useWallet()

  return (
    <aside
      className="w-64 flex flex-col"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo — brutalist */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <motion.button
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer bg-transparent border-none"
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Logo size={48} />
          <div className="text-left">
            <h1 className="text-base font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>DeadSwitch</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: 'var(--text-m)' }}>Protocol v1.0</p>
          </div>
        </motion.button>
      </div>

      {/* Wallet info */}
      <div>
        {isConnected ? (
          <div className="px-5 py-4 relative overflow-hidden" style={{ borderBottom: '1px solid var(--border)' }}>
            {/* PixelBlast background */}
            <div className="absolute inset-0 z-0 opacity-20">
              <PixelBlast
                variant="square"
                pixelSize={3}
                color="#FF2D20"
                speed={0.8}
                patternScale={4}
                patternDensity={0.7}
                edgeFade={0.15}
                enableRipples={false}
                transparent={true}
                antialias={false}
              />
            </div>
            <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-success" />
              {walletInfo?.icon && <img src={walletInfo.icon} alt="" className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono uppercase tracking-[0.1em]" style={{ color: 'var(--text-m)' }}>
                {providerName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono font-bold" style={{ color: 'var(--text-h)' }}>{shortAddress}</p>
              <motion.button
                onClick={() => { navigator.clipboard.writeText(address || '') }}
                className="cursor-pointer bg-transparent border-none p-0.5"
                style={{ color: 'var(--text-m)' }}
                whileHover={{ color: '#FF2D20' }}
                whileTap={{ scale: 0.85 }}
                title="Copy address"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              </motion.button>
            </div>
            <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-m)' }}>
              {parseFloat(balance || 0).toFixed(4)} {chainInfo.nativeSymbol}
            </p>
            <p className="text-xs font-bold mt-0.5" style={{ color: '#FF2D20' }}>
              ${totalValueUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <motion.button
              onClick={onDisconnect}
              className="mt-3 w-full py-2.5 text-[11px] font-mono uppercase tracking-[0.15em] font-bold cursor-pointer flex items-center justify-center gap-2"
              style={{ background: '#FF2D20', border: '1px solid #FF2D20', color: '#000', boxShadow: '3px 3px 0px var(--border)', transform: 'translate(-1px, -1px)' }}
              whileHover={{ x: 0, y: 0, boxShadow: '3px 3px 0px #FF2D20', backgroundColor: 'transparent', color: '#FF2D20' }}
              whileTap={{ x: 1, y: 1, boxShadow: '1px 1px 0px #FF2D20' }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Disconnect
            </motion.button>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={onConnectWallet}
            className="w-full py-4 text-sm font-bold uppercase tracking-wider text-white cursor-pointer"
            style={{ background: '#FF2D20', border: 'none', borderBottom: '1px solid var(--border)' }}
            whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px var(--border-strong)' }}
            whileTap={{ x: 0, y: 0 }}
          >
            Connect Wallet
          </motion.button>
        )}
      </div>

      {/* Navigation — brutalist with PixelBlast on active */}
      <nav className="flex-1">
        {nav.map(item => {
          const isActive = activePage === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-[0.12em] font-bold cursor-pointer border-none relative overflow-hidden"
              style={{
                background: isActive ? 'linear-gradient(135deg, #FFB3AD 0%, #FFC9B8 50%, #FFE5A0 100%)' : 'transparent',
                color: isActive ? '#000' : 'var(--text-p)',
                border: '1px solid transparent',
              }}
              whileHover={!isActive ? { x: 4, color: 'var(--text-h)' } : {}}
              whileTap={{ scale: 0.98 }}
            >
              {/* PixelBlast background on active tab */}
              {isActive && (
                <div className="absolute inset-0 z-0 opacity-30">
                  <PixelBlast
                    variant="square"
                    pixelSize={3}
                    color="#000000"
                    speed={1.5}
                    patternScale={3}
                    patternDensity={0.9}
                    edgeFade={0.2}
                    enableRipples={false}
                    transparent={true}
                    antialias={false}
                  />
                </div>
              )}
              <span className="relative z-10 flex items-center gap-3">
                <item.icon active={isActive} />
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-success" />
            <span className="text-[10px] font-mono uppercase tracking-[0.1em]" style={{ color: 'var(--text-m)' }}>Active</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-2 px-2">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: 'var(--text-m)' }}>Powered by</p>
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-p)' }}>OKX OnchainOS</p>
        </div>
      </div>
    </aside>
  )
}

function DashboardIcon({ active }) {
  return <PixelDashboardIcon size={16} color={active ? '#000' : 'var(--text-m)'} />
}

function ConfigIcon({ active }) {
  return <PixelConfigIcon size={16} color={active ? '#000' : 'var(--text-m)'} />
}

function HistoryIcon({ active }) {
  return <PixelHistoryIcon size={16} color={active ? '#000' : 'var(--text-m)'} />
}
