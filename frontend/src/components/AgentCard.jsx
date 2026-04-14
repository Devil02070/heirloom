import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApi, apiPost } from '../hooks/useApi'

/**
 * AgentCard — the Agentic Wallet identity + auto-trigger simulator.
 *
 * Shows the agent's address + OKB balance on X Layer mainnet, and a
 * "Test Auto-Trigger" button that executes the Dead Man's Switch flow
 * via the agent's TEE-signed transactions (onchainos wallet send).
 */
export default function AgentCard({ onExecuted }) {
  const { data: agent, loading, refetch } = useApi('/agent/status')
  const [confirming, setConfirming] = useState(false)
  const [amount, setAmount] = useState('0.01')
  const [executing, setExecuting] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (!agent?.evmAddress) return
    navigator.clipboard.writeText(agent.evmAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const runAutoTrigger = async () => {
    setExecuting(true)
    setError(null)
    setResults(null)
    try {
      const res = await apiPost('/execute/auto', { amountOKB: amount })
      setResults(res)
      if (onExecuted) onExecuted()
      // Refresh agent balance
      setTimeout(() => refetch(), 1500)
    } catch (err) {
      setError(err.message || 'Auto-trigger failed')
    } finally {
      setExecuting(false)
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
        <p className="text-xs font-mono" style={{ color: 'var(--text-m)' }}>Loading agent status...</p>
      </div>
    )
  }

  if (!agent?.ok || !agent?.loggedIn) {
    return (
      <div className="p-6" style={{ border: '1px solid #eab308', background: 'rgba(234,179,8,0.05)' }}>
        <h3 className="text-sm font-black uppercase tracking-wider mb-2" style={{ color: '#eab308' }}>
          Agent Wallet Not Available
        </h3>
        <p className="text-xs font-mono" style={{ color: 'var(--text-p)' }}>
          {agent?.error || 'Agent not logged in. Run `onchainos wallet login <email>` on the server.'}
        </p>
      </div>
    )
  }

  const shortAddr = agent.evmAddress
    ? `${agent.evmAddress.slice(0, 8)}...${agent.evmAddress.slice(-6)}`
    : '—'

  return (
    <div className="p-6" style={{ border: '1px solid #6366f1', background: 'var(--card-bg)' }}>
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-h)' }}>
            <span className="w-2 h-2" style={{ background: '#6366f1' }} />
            Agent Wallet — Dead Man's Switch
          </h3>
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] mt-1" style={{ color: 'var(--text-m)' }}>
            Auto-triggers when inactivity threshold is exceeded. Signs via OKX TEE.
          </p>
        </div>
        <span
          className="text-[9px] font-mono font-bold uppercase px-2 py-1"
          style={{ border: '1px solid #6366f1', color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}
        >
          ONCHAIN OS AGENTIC WALLET
        </span>
      </div>

      {/* Identity grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--text-m)' }}>Email</p>
          <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-h)' }}>{agent.email}</p>
        </div>
        <div className="p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--text-m)' }}>Chain</p>
          <p className="text-xs font-mono font-bold flex items-center gap-2" style={{ color: 'var(--text-h)' }}>
            {agent.chain}
            {agent.gasFree && (
              <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ border: '1px solid #22C55E', color: '#22C55E' }}>
                GAS-FREE
              </span>
            )}
          </p>
        </div>
        <div className="p-3 col-span-1 md:col-span-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--text-m)' }}>
                Agent Address (EVM)
              </p>
              <p className="text-xs font-mono font-bold truncate" style={{ color: 'var(--text-h)' }}>
                {agent.evmAddress}
              </p>
            </div>
            <button
              onClick={copyAddress}
              className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase cursor-pointer border-none flex-shrink-0"
              style={{ background: copied ? '#22C55E' : 'var(--surface-3)', color: copied ? '#000' : 'var(--text-p)' }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="p-3 col-span-1 md:col-span-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: 'var(--text-m)' }}>Agent Balance</p>
              <p className="text-lg font-black font-mono" style={{ color: agent.hasFunds ? '#22C55E' : '#eab308' }}>
                {parseFloat(agent.balanceOKB).toFixed(4)} OKB
              </p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--text-m)' }}>
                ${parseFloat(agent.balanceUSD).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase cursor-pointer border-none"
              style={{ background: 'var(--surface-3)', color: 'var(--text-p)' }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Fund hint */}
      {!agent.hasFunds && (
        <div className="p-3 mb-4" style={{ background: 'rgba(234,179,8,0.05)', border: '1px dashed #eab308' }}>
          <p className="text-[11px] font-mono" style={{ color: '#eab308' }}>
            → Agent wallet is empty. Send a small amount of OKB to the address above on <strong>{agent.chain}</strong> (gas-free) to enable the auto-trigger flow.
          </p>
        </div>
      )}

      {/* Auto-trigger flow */}
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--text-m)' }}>
          Test Auto-Trigger
        </p>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <label className="text-xs font-mono" style={{ color: 'var(--text-p)' }}>
            Distribute total:
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={executing}
            className="w-28 px-2 py-1.5 text-xs font-mono"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-h)' }}
          />
          <span className="text-xs font-mono" style={{ color: 'var(--text-m)' }}>OKB across all beneficiaries</span>
        </div>

        <AnimatePresence>
          {confirming && !executing && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-3 overflow-hidden">
              <div className="p-3" style={{ border: '1px solid #6366f1', background: 'rgba(99,102,241,0.05)' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#6366f1' }}>
                  Confirm agent execution
                </p>
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-p)' }}>
                  The agent wallet will send <strong>{amount} OKB</strong> total, split by allocation, from <span className="break-all">{shortAddr}</span> on {agent.chain}. Signed by OKX TEE. Irreversible.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <button
            onClick={() => confirming ? runAutoTrigger() : setConfirming(true)}
            disabled={executing || !agent.hasFunds}
            className="flex-1 py-2.5 px-4 font-black uppercase tracking-wider text-xs text-white cursor-pointer border-none"
            style={{
              background: executing || !agent.hasFunds ? '#555' : '#6366f1',
              opacity: executing || !agent.hasFunds ? 0.5 : 1,
            }}
          >
            {executing ? 'Executing...' : confirming ? '▶ RUN AUTO-TRIGGER' : 'Test Auto-Trigger'}
          </button>
          {confirming && !executing && (
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2.5 text-[10px] font-mono font-bold uppercase cursor-pointer"
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-p)' }}
            >
              Cancel
            </button>
          )}
        </div>

        {error && (
          <p className="mt-2 text-[11px] font-mono p-2" style={{ color: '#FF2D20', border: '1px solid #FF2D20' }}>
            {error}
          </p>
        )}

        {results && (
          <div className="mt-3 space-y-1.5">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em]" style={{ color: results.success ? '#22C55E' : '#FF2D20' }}>
              {results.success ? `✓ Agent executed ${results.results?.length || 0} transfer(s)` : '✗ Execution failed'}
            </p>
            {results.results?.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2 text-[11px] font-mono" style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                <span style={{ color: 'var(--text-p)' }} className="truncate">
                  {r.amount} {r.token} → {r.beneficiary}
                </span>
                {r.txHash ? (
                  <a
                    href={`https://www.okx.com/web3/explorer/xlayer/tx/${r.txHash}`}
                    target="_blank" rel="noreferrer"
                    className="ml-2 text-[10px]" style={{ color: '#22C55E' }}
                  >
                    {r.txHash.slice(0, 10)}...{r.txHash.slice(-6)}
                  </a>
                ) : (
                  <span style={{ color: '#FF2D20' }}>{r.error || 'failed'}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
