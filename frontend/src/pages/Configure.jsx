import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi, apiPost } from '../hooks/useApi'
import { useWallet } from '../context/WalletContext'

export default function Configure() {
  const { address } = useWallet()
  const { data: config, loading, refetch } = useApi('/config')
  const [form, setForm] = useState({
    inactivityThresholdDays: 30,
    targetStablecoin: 'USDC',
    beneficiaries: [],
    actions: { withdrawDefi: true, swapToStable: true, revokeApprovals: true, transferToBeneficiaries: true },
  })
  const [newBeneficiary, setNewBeneficiary] = useState({ name: '', address: '', allocationPercent: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (config) {
      setForm({
        inactivityThresholdDays: config.inactivityThresholdDays || 30,
        targetStablecoin: config.targetStablecoin || 'USDC',
        beneficiaries: config.beneficiaries || [],
        actions: config.actions || form.actions,
      })
    }
  }, [config])

  const addBeneficiary = () => {
    if (!newBeneficiary.name || !newBeneficiary.address || !newBeneficiary.allocationPercent) return
    setForm(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, { ...newBeneficiary, allocationPercent: Number(newBeneficiary.allocationPercent) }],
    }))
    setNewBeneficiary({ name: '', address: '', allocationPercent: '' })
  }

  const removeBeneficiary = (index) => {
    setForm(prev => ({ ...prev, beneficiaries: prev.beneficiaries.filter((_, i) => i !== index) }))
  }

  const totalAllocation = form.beneficiaries.reduce((sum, b) => sum + b.allocationPercent, 0)

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiPost('/config', { ...form, ownerAddress: address })
      setSaved(true)
      refetch()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      alert(`Failed to save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--text-h)' }}>Configure</h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] mt-1" style={{ color: 'var(--text-m)' }}>Emergency plan parameters</p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 font-black uppercase tracking-wider text-sm text-white cursor-pointer border-none disabled:opacity-50"
          style={{ background: saved ? '#22C55E' : '#FF2D20', color: saved ? '#000' : '#fff' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Configuration'}
        </motion.button>
      </div>

      {/* Inactivity Threshold */}
      <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-h)' }}>Inactivity Threshold</h3>
        <p className="text-xs font-mono mb-5" style={{ color: 'var(--text-m)' }}>How long without wallet activity before the emergency plan triggers</p>
        <div className="flex items-center gap-6">
          <input
            type="range" min="1" max="90"
            value={form.inactivityThresholdDays}
            onChange={e => setForm(prev => ({ ...prev, inactivityThresholdDays: Number(e.target.value) }))}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-accent"
            style={{ background: 'var(--surface-3)' }}
          />
          <div className="flex items-baseline gap-1 min-w-[80px]">
            <span className="text-3xl font-bold text-gradient">{form.inactivityThresholdDays}</span>
            <span className="text-sm" style={{ color: 'var(--text-m)' }}>days</span>
          </div>
        </div>
      </div>

      {/* Target Stablecoin */}
      <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-h)' }}>Target Stablecoin</h3>
        <p className="text-xs font-mono mb-5" style={{ color: 'var(--text-m)' }}>All tokens will be swapped to this stablecoin before transfer</p>
        <div className="flex gap-3">
          {['USDC', 'USDT'].map(coin => (
            <motion.button
              key={coin}
              onClick={() => setForm(prev => ({ ...prev, targetStablecoin: coin }))}
              className="px-6 py-3 text-sm font-bold uppercase cursor-pointer border-none"
              style={{
                background: form.targetStablecoin === coin ? '#FF2D20' : 'var(--surface-3)',
                color: form.targetStablecoin === coin ? '#fff' : 'var(--text-p)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {coin}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Emergency Actions */}
      <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <h3 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: 'var(--text-h)' }}>Emergency Actions</h3>
        <p className="text-xs font-mono mb-5" style={{ color: 'var(--text-m)' }}>Choose which actions to execute when triggered</p>
        <div className="space-y-3">
          {[
            { key: 'withdrawDefi', label: 'Withdraw DeFi Positions', desc: 'Exit all LP, lending, and staking positions' },
            { key: 'swapToStable', label: 'Swap to Stablecoins', desc: 'Convert all tokens to target stablecoin' },
            { key: 'revokeApprovals', label: 'Revoke Approvals', desc: 'Remove all unnecessary token approvals' },
            { key: 'transferToBeneficiaries', label: 'Transfer to Beneficiaries', desc: 'Send funds to configured addresses' },
          ].map(action => (
            <motion.div
              key={action.key}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              whileHover={{ borderColor: 'var(--border-strong)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>{action.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-m)' }}>{action.desc}</p>
              </div>
              <motion.button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, actions: { ...prev.actions, [action.key]: !prev.actions[action.key] } }))}
                className="relative w-11 h-6 rounded-full cursor-pointer flex-shrink-0 border-none"
                style={{ background: form.actions[action.key] ? '#FF2D20' : 'var(--surface-3)' }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"
                  animate={{ x: form.actions[action.key] ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-h)' }}>Beneficiaries</h3>
          {totalAllocation > 0 && (
            <span className="text-sm font-medium" style={{ color: totalAllocation === 100 ? '#22C55E' : '#FFB800' }}>
              {totalAllocation}% allocated
            </span>
          )}
        </div>
        <p className="text-xs font-mono mb-5" style={{ color: 'var(--text-m)' }}>Add wallet addresses that will receive your funds</p>

        <AnimatePresence>
          {form.beneficiaries.map((b, i) => (
            <motion.div
              key={`${b.address}-${i}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between p-3 mb-2"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                  {b.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-h)' }}>{b.name}</p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-m)' }}>{b.address.slice(0, 10)}...{b.address.slice(-6)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold" style={{ color: '#FF2D20' }}>{b.allocationPercent}%</span>
                <motion.button
                  onClick={() => removeBeneficiary(i)}
                  className="w-7 h-7 flex items-center justify-center cursor-pointer border-none"
                  style={{ background: 'transparent', color: '#FF2D20', border: '1px solid #FF2D20' }}
                  whileHover={{ background: 'rgba(255,45,32,0.1)' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_0.7fr_auto] gap-3 items-end mt-4">
          {[
            { label: 'Name', placeholder: 'Alice', key: 'name', type: 'text' },
            { label: 'Wallet Address', placeholder: '0x...', key: 'address', type: 'text', mono: true },
            { label: 'Allocation %', placeholder: '50', key: 'allocationPercent', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-m)' }}>{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={newBeneficiary[field.key]}
                onChange={e => setNewBeneficiary(prev => ({ ...prev, [field.key]: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none ${field.mono ? 'font-mono' : ''}`}
                style={{
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-h)',
                }}
                onFocus={e => e.target.style.borderColor = '#FF2D20'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          ))}
          <motion.button
            onClick={addBeneficiary}
            className="px-4 py-2.5 text-sm font-bold uppercase text-white cursor-pointer border-none"
            style={{ background: '#FF2D20' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add
          </motion.button>
        </div>

        {totalAllocation > 0 && totalAllocation !== 100 && (
          <p className="text-xs mt-3" style={{ color: '#FFB800' }}>
            Total allocation is {totalAllocation}%. It should equal 100%.
          </p>
        )}
      </div>
    </motion.div>
  )
}
