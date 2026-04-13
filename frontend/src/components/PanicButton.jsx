import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiPost } from '../hooks/useApi'

export default function PanicButton({ onTriggered }) {
  const [confirming, setConfirming] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [step, setStep] = useState(null)

  const handlePanic = async () => {
    if (!confirming) { setConfirming(true); return }
    setExecuting(true)
    try {
      const steps = [
        { label: 'Scanning DeFi positions...', endpoint: '/execute/scan' },
        { label: 'Withdrawing positions...', endpoint: '/execute/withdraw' },
        { label: 'Swapping to stablecoins...', endpoint: '/execute/swap' },
        { label: 'Transferring to beneficiaries...', endpoint: '/execute/transfer' },
      ]
      for (let i = 0; i < steps.length; i++) {
        setStep({ current: i + 1, total: steps.length, label: steps[i].label })
        await apiPost(steps[i].endpoint)
        await new Promise(r => setTimeout(r, 800))
      }
      setStep({ current: steps.length, total: steps.length, label: 'Complete!' })
      if (onTriggered) onTriggered()
    } catch (err) {
      setStep({ current: 0, total: 0, label: `Error: ${err.message}` })
    } finally {
      setTimeout(() => { setExecuting(false); setConfirming(false); setStep(null) }, 3000)
    }
  }

  if (executing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6" style={{ border: '1px solid #FF2D20', background: 'var(--card-bg)' }}>
        <div className="flex items-center gap-3 mb-4">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-3 h-3" style={{ background: '#FF2D20' }} />
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: '#FF2D20' }}>Emergency Protocol Active</h3>
        </div>
        {step && (
          <>
            <div className="w-full h-2 mb-3" style={{ background: 'var(--surface-3)' }}>
              <motion.div className="h-2" style={{ background: '#FF2D20' }} initial={{ width: 0 }} animate={{ width: `${(step.current / step.total) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-xs font-mono" style={{ color: 'var(--text-p)' }}>Step {step.current}/{step.total}: {step.label}</p>
          </>
        )}
      </motion.div>
    )
  }

  return (
    <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-h)' }}>Emergency Liquidation</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-m)' }}>Instantly liquidate all positions and transfer to beneficiaries</p>
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 overflow-hidden">
            <div className="p-4" style={{ border: '1px solid #FF2D20', background: 'rgba(255,45,32,0.05)' }}>
              <p className="text-xs font-bold" style={{ color: '#FF2D20' }}>
                WARNING: This will liquidate ALL positions, swap to stablecoins, and transfer everything to your configured beneficiaries. This cannot be undone.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <motion.button
          onClick={handlePanic}
          className="flex-1 py-3 px-6 font-black uppercase tracking-wider text-sm text-white cursor-pointer border-none"
          style={{ background: '#FF2D20' }}
          whileHover={{ x: -2, y: -2, boxShadow: '4px 4px 0px #000' }}
          whileTap={{ x: 0, y: 0 }}
        >
          {confirming ? 'CONFIRM LIQUIDATION' : 'PANIC BUTTON'}
        </motion.button>
        <AnimatePresence>
          {confirming && (
            <motion.button
              initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              onClick={() => setConfirming(false)}
              className="py-3 px-6 font-bold uppercase tracking-wider text-xs cursor-pointer whitespace-nowrap"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-p)' }}
            >
              Cancel
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
