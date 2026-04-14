import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseEther, parseUnits, formatEther, Contract } from 'ethers'
import { useWallet } from '../context/WalletContext'
import { useApi, apiPost } from '../hooks/useApi'

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
]

// Get legacy gas price with X Layer Testnet minimum of 1 gwei.
// The RPC sometimes reports 0.02 gwei which OKX Wallet's pre-simulator rejects.
async function getLegacyGasPrice(provider) {
  const MIN = parseUnits('1', 'gwei') // X Layer Testnet floor
  try {
    const fee = await provider.getFeeData()
    const reported = fee.gasPrice || fee.maxFeePerGas || 0n
    return reported > MIN ? reported : MIN
  } catch {
    return MIN
  }
}

// Send via the raw EIP-1193 provider (bypasses ethers middleware entirely).
// Uses the Reown walletProvider preferentially, falls back to injected.
async function rawWalletSend(rawProvider, from, to, valueWei, opts = {}) {
  const raw = rawProvider || window.okxwallet || window.ethereum
  if (!raw) throw new Error('No wallet provider found')
  const params = {
    from,
    to,
    value: '0x' + valueWei.toString(16),
  }
  if (opts.gasLimit) params.gas = '0x' + BigInt(opts.gasLimit).toString(16)
  if (opts.gasPrice) params.gasPrice = '0x' + BigInt(opts.gasPrice).toString(16)
  console.log('[Panic] rawWalletSend params:', params)
  return await raw.request({ method: 'eth_sendTransaction', params: [params] })
}

// Estimate gas via raw RPC to surface the chain's real error (instead of wallet's
// generic "Transaction failed"). Returns gasLimit in wei or throws with the real reason.
async function estimateGasRaw(walletProvider, from, to, valueWei) {
  const params = { from, to, value: '0x' + valueWei.toString(16) }
  console.log('[Panic] estimateGas params:', params)
  try {
    const result = await walletProvider.request({
      method: 'eth_estimateGas',
      params: [params],
    })
    const gas = BigInt(result)
    console.log(`[Panic] eth_estimateGas succeeded: ${gas} gas`)
    return gas
  } catch (err) {
    console.error('[Panic] eth_estimateGas failed — this is the REAL chain error:', err)
    throw err
  }
}

// Diagnostic: log everything we know about the chain + wallet before sending.
async function logDiagnostics(provider, walletProvider, address) {
  try {
    const [network, balance, feeData, nonce, blockNumber] = await Promise.all([
      provider.getNetwork(),
      provider.getBalance(address),
      provider.getFeeData(),
      provider.getTransactionCount(address),
      provider.getBlockNumber(),
    ])
    console.log('[Panic] DIAGNOSTICS:', {
      chainId: Number(network.chainId),
      blockNumber,
      balanceWei: balance.toString(),
      balanceOKB: Number(balance) / 1e18,
      nonce,
      gasPrice: feeData.gasPrice?.toString(),
      maxFeePerGas: feeData.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
      walletChainId: await walletProvider?.request?.({ method: 'eth_chainId' }).catch(() => 'unknown'),
    })
  } catch (err) {
    console.error('[Panic] diagnostics failed:', err)
  }
}

// Extract a human-readable error from any ethers/wallet error shape.
function extractError(err) {
  return (
    err?.info?.error?.message ||
    err?.error?.message ||
    err?.data?.message ||
    err?.shortMessage ||
    err?.reason ||
    err?.message ||
    'Transfer failed'
  )
}

export default function PanicButton({ onTriggered }) {
  const {
    isConnected, signer, provider, walletProvider, address, chainId,
    balance, nativeBalanceUSD, tokens, totalValueUSD,
    chainInfo, refreshBalances,
  } = useWallet()
  const { data: config } = useApi('/config')

  const [confirming, setConfirming] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [step, setStep] = useState(null)
  const [results, setResults] = useState([])

  const finish = (ms = 5000) => {
    setTimeout(() => {
      setExecuting(false)
      setConfirming(false)
      setStep(null)
      setResults([])
    }, ms)
  }

  const handlePanic = async () => {
    if (!confirming) { setConfirming(true); return }

    if (!isConnected || !signer) {
      setExecuting(true)
      setStep({ current: 0, total: 4, label: 'Error: wallet not connected', error: true })
      return finish(3000)
    }
    if (chainId !== 195) {
      setExecuting(true)
      setStep({ current: 0, total: 4, label: 'Error: switch to X Layer Testnet first', error: true })
      return finish(3000)
    }
    if (!config?.beneficiaries?.length) {
      setExecuting(true)
      setStep({ current: 0, total: 4, label: 'Error: no beneficiaries configured', error: true })
      return finish(3000)
    }

    setExecuting(true)
    setResults([])
    const allResults = []

    try {
      // Step 1: Scan
      setStep({ current: 1, total: 4, label: 'Scanning wallet...' })
      await new Promise(r => setTimeout(r, 400))

      // Filter beneficiaries that aren't the sender (self-sends fail silently on OKX wallet).
      // If ALL are self-sends, we still attempt but warn clearly.
      const me = (address || '').toLowerCase()
      const beneficiaries = config.beneficiaries.filter(b => b.address && parseFloat(b.allocationPercent) > 0)
      const validBeneficiaries = beneficiaries.filter(b => b.address.toLowerCase() !== me)
      const skippedSelf = beneficiaries.length - validBeneficiaries.length

      if (validBeneficiaries.length === 0) {
        setStep({
          current: 0, total: 4,
          label: skippedSelf > 0
            ? 'Error: beneficiary is your own address. Add a different address in Configure.'
            : 'Error: no valid beneficiaries with allocation > 0',
          error: true,
        })
        return finish(6000)
      }

      // Step 2: Compute distributable (50% of native balance).
      // OKX Wallet on X Layer Testnet is extremely conservative about gas estimation —
      // 50% reserve guarantees no "insufficient balance" pre-sim rejection.
      setStep({ current: 2, total: 4, label: 'Computing transfer amounts (50% — 50% reserved for gas)...' })
      await logDiagnostics(provider, walletProvider, address)
      const gasPrice = await getLegacyGasPrice(provider)

      const nativeBalWei = parseEther(parseFloat(balance || 0).toFixed(18))
      // Rule: transfer 50% of native balance. Remaining 50% stays in wallet for gas.
      const distributableWei = (nativeBalWei * 50n) / 100n
      const gasReserveWei = nativeBalWei - distributableWei
      console.log('[Panic] balance:', formatEther(nativeBalWei), '→ distributable (50%):', formatEther(distributableWei), 'gas reserve (50%):', formatEther(gasReserveWei))

      if (distributableWei === 0n && tokens.length === 0) {
        setStep({
          current: 0, total: 4,
          label: `Error: wallet is empty (${balance} ${chainInfo.nativeSymbol}).`,
          error: true,
        })
        return finish(6000)
      }

      // Step 3: Transfer ERC20 tokens
      if (tokens.length > 0) {
        setStep({ current: 3, total: 4, label: 'Transferring tokens...' })
        for (const token of tokens) {
          for (const b of validBeneficiaries) {
            const share = parseFloat(token.balance) * (b.allocationPercent / 100)
            if (share <= 0) continue
            try {
              const contract = new Contract(token.address, ERC20_ABI, signer)
              const amount = parseUnits(share.toFixed(Math.min(token.decimals, 18)), token.decimals)
              const tx = await contract.transfer(b.address, amount, {
                gasLimit: 100000n,
                gasPrice,
              })
              allResults.push({
                beneficiary: b.name, address: b.address,
                token: token.symbol, amount: share.toFixed(6),
                txHash: tx.hash, status: 'pending',
              })
              setResults([...allResults])
              await tx.wait()
              allResults[allResults.length - 1].status = 'completed'
              setResults([...allResults])
            } catch (err) {
              console.error('[Panic] ERC20 transfer failed — full error:', err)
              allResults.push({
                beneficiary: b.name, address: b.address,
                token: token.symbol, amount: share.toFixed(6),
                status: 'failed',
                error: extractError(err),
              })
              setResults([...allResults])
            }
          }
        }
      }

      // Step 4: Transfer native OKB
      setStep({ current: 4, total: 4, label: `Transferring ${chainInfo.nativeSymbol}...` })
      // Compute shares in wei (exact, no float rounding loss)
      const totalAlloc = validBeneficiaries.reduce((s, b) => s + parseFloat(b.allocationPercent), 0)
      for (const b of validBeneficiaries) {
        const shareWei = (distributableWei * BigInt(Math.floor(b.allocationPercent * 1000))) / BigInt(Math.floor(totalAlloc * 1000))
        if (shareWei === 0n) continue
        const amountStr = formatEther(shareWei)

        // Single-path transfer — only ONE wallet confirmation pops up.
        try {
          console.log(`[Panic] sending ${amountStr} OKB → ${b.address} @ ${gasPrice} wei gasPrice`)
          const txHash = await rawWalletSend(walletProvider, address, b.address, shareWei, {
            gasLimit: 21000n,
            gasPrice,
          })
          allResults.push({
            beneficiary: b.name, address: b.address,
            token: chainInfo.nativeSymbol, amount: parseFloat(amountStr).toFixed(6),
            txHash, status: 'pending',
          })
          setResults([...allResults])
          const receipt = await provider.waitForTransaction(txHash, 1, 60000)
          allResults[allResults.length - 1].status = receipt?.status === 1 ? 'completed' : 'failed'
          setResults([...allResults])
        } catch (err) {
          console.error('[Panic] transfer failed:', err)
          allResults.push({
            beneficiary: b.name, address: b.address,
            token: chainInfo.nativeSymbol, amount: parseFloat(amountStr).toFixed(6),
            status: 'failed',
            error: extractError(err),
          })
          setResults([...allResults])
        }
      }

      // Record execution in backend history
      try {
        await apiPost('/execute/record', {
          trigger: 'Panic Button',
          totalUSD: totalValueUSD,
          results: allResults,
          chain: 'X Layer Testnet',
        })
      } catch {}

      const successCount = allResults.filter(r => r.status === 'completed').length
      setStep({
        current: 4, total: 4,
        label: successCount > 0
          ? `Complete — ${successCount}/${allResults.length} transfers sent`
          : 'Failed — see errors below',
        error: successCount === 0,
      })

      if (onTriggered) onTriggered()
      if (refreshBalances) refreshBalances()
    } catch (err) {
      setStep({ current: 0, total: 4, label: `Error: ${err.message}`, error: true })
    } finally {
      finish(8000)
    }
  }

  if (executing) {
    const barColor = step?.error ? '#eab308' : '#FF2D20'
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6" style={{ border: `1px solid ${barColor}`, background: 'var(--card-bg)' }}>
        <div className="flex items-center gap-3 mb-4">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-3 h-3" style={{ background: barColor }} />
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: barColor }}>
            {step?.error ? 'Protocol Halted' : 'Emergency Protocol Active'}
          </h3>
        </div>
        {step && (
          <>
            <div className="w-full h-2 mb-3" style={{ background: 'var(--surface-3)' }}>
              <motion.div className="h-2" style={{ background: barColor }} initial={{ width: 0 }} animate={{ width: `${(step.current / (step.total || 1)) * 100}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-xs font-mono" style={{ color: 'var(--text-p)' }}>
              {step.total > 0 && `Step ${step.current}/${step.total}: `}{step.label}
            </p>
          </>
        )}
        {results.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between gap-2 p-2 text-[11px] font-mono" style={{ border: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--text-p)' }} className="truncate">
                    {r.amount} {r.token} → {r.beneficiary}
                  </p>
                  {r.txHash && (
                    <a
                      href={`https://www.okx.com/web3/explorer/xlayer-test/tx/${r.txHash}`}
                      target="_blank" rel="noreferrer"
                      className="truncate block"
                      style={{ color: 'var(--text-m)' }}
                    >
                      {r.txHash.slice(0, 10)}...{r.txHash.slice(-8)}
                    </a>
                  )}
                  {r.error && <p style={{ color: '#eab308' }} className="truncate">{r.error}</p>}
                </div>
                <span
                  className="text-[9px] font-bold uppercase px-2 py-0.5"
                  style={{
                    border: `1px solid ${r.status === 'completed' ? '#22C55E' : r.status === 'failed' ? '#eab308' : 'var(--border)'}`,
                    color: r.status === 'completed' ? '#22C55E' : r.status === 'failed' ? '#eab308' : 'var(--text-m)',
                  }}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  const isTestnet = chainId === 195
  const disabled = !isConnected || !isTestnet || !config?.beneficiaries?.length

  return (
    <div className="p-6" style={{ border: '1px solid var(--border)', background: 'var(--card-bg)' }}>
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-h)' }}>Emergency Liquidation</h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-m)' }}>
          Instantly transfer all assets from your connected wallet to configured beneficiaries.
        </p>
        {disabled && (
          <p className="text-[11px] mt-2 font-mono" style={{ color: '#eab308' }}>
            {!isConnected
              ? '→ Connect wallet to enable'
              : !isTestnet
              ? '→ Switch to X Layer Testnet'
              : '→ Add at least one beneficiary in Configure'}
          </p>
        )}
      </div>

      <AnimatePresence>
        {confirming && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 overflow-hidden">
            <div className="p-4" style={{ border: '1px solid #FF2D20', background: 'rgba(255,45,32,0.05)' }}>
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <p className="text-xs font-bold" style={{ color: '#FF2D20' }}>
                  WARNING: This will send a real transaction from your wallet.
                </p>
                <span
                  className="text-[9px] font-mono font-bold uppercase px-2 py-0.5"
                  style={{
                    border: isTestnet ? '1px solid #eab308' : '1px solid #FF2D20',
                    color: isTestnet ? '#eab308' : '#FF2D20',
                    background: isTestnet ? 'rgba(234,179,8,0.1)' : 'rgba(255,45,32,0.1)',
                  }}
                >
                  {isTestnet ? '✓ X LAYER TESTNET' : `⚠ CHAIN ${chainId || '?'}`}
                </span>
              </div>
              <p className="text-[11px] font-mono" style={{ color: 'var(--text-p)' }}>
                Balance: {parseFloat(balance || 0).toFixed(4)} {chainInfo?.nativeSymbol || 'OKB'} • Beneficiaries: {config?.beneficiaries?.length || 0}
              </p>
              <p className="text-[11px] font-mono mt-1" style={{ color: '#22C55E' }}>
                → Will transfer {(parseFloat(balance || 0) * 0.5).toFixed(4)} {chainInfo?.nativeSymbol || 'OKB'} (50%). Remaining {(parseFloat(balance || 0) * 0.5).toFixed(4)} stays for gas.
              </p>
              {config?.beneficiaries?.some(b => address && b.address?.toLowerCase() === address.toLowerCase()) && (
                <p className="text-[11px] font-mono mt-2 p-2" style={{ color: '#eab308', background: 'rgba(234,179,8,0.1)', border: '1px dashed #eab308' }}>
                  ⚠ Beneficiary is your own wallet address — wallets reject self-sends. Add a different address in Configure.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <motion.button
          onClick={handlePanic}
          disabled={disabled && !confirming}
          className="flex-1 py-3 px-6 font-black uppercase tracking-wider text-sm text-white cursor-pointer border-none"
          style={{ background: disabled && !confirming ? '#555' : '#FF2D20', opacity: disabled && !confirming ? 0.5 : 1 }}
          whileHover={disabled && !confirming ? {} : { x: -2, y: -2, boxShadow: '4px 4px 0px #000' }}
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
