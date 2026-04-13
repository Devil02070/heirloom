import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { WalletProvider, useWallet } from './context/WalletContext'
import ConnectWalletModal from './components/ConnectWalletModal'
import Landing from './pages/Landing'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Configure from './pages/Configure'
import History from './pages/History'

function AppContent() {
  const [view, setView] = useState('landing')
  const [page, setPage] = useState('dashboard')
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const { isConnected, disconnect } = useWallet()

  // When wallet connects, switch to app view
  useEffect(() => {
    if (isConnected && walletModalOpen) {
      setWalletModalOpen(false)
      setView('app')
    }
  }, [isConnected, walletModalOpen])

  const launchApp = () => {
    if (isConnected) {
      setView('app')
    } else {
      setWalletModalOpen(true)
    }
  }

  const goHome = () => setView('landing')

  const handleDisconnect = () => {
    disconnect()
    setView('landing')
  }

  return (
    <>
      <ConnectWalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Landing
              onLaunchApp={launchApp}
              onConnectWallet={() => setWalletModalOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="flex h-screen overflow-hidden"
            style={{ background: 'var(--surface)' }}
          >
            <Sidebar
              activePage={page}
              onNavigate={setPage}
              onGoHome={goHome}
              onConnectWallet={() => setWalletModalOpen(true)}
              onDisconnect={handleDisconnect}
            />
            <main className="flex-1 overflow-y-auto" style={{ background: 'var(--surface)' }}>
              <div className="max-w-6xl mx-auto p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={page}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {page === 'dashboard' && <Dashboard />}
                    {page === 'configure' && <Configure />}
                    {page === 'history' && <History />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ThemeProvider>
  )
}
