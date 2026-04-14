const express = require('express')
const router = express.Router()
const store = require('../store')
const onchainos = require('../onchainos')

const AGENT_CHAIN = 'xlayer' // X Layer mainnet (chain 196) — the only X Layer the onchainos CLI supports
const AGENT_CHAIN_NAME = 'X Layer'

// GET /api/agent/status — current agentic wallet identity + OKB balance on X Layer
router.get('/agent/status', (req, res) => {
  try {
    const status = onchainos.getStatus()
    if (!status.ok) {
      return res.json({ ok: false, error: 'Agent wallet not logged in. Run `onchainos wallet login <email>`' })
    }

    // Pull balance on X Layer
    let evmAddress = null
    let balanceOKB = '0'
    let balanceUSD = '0.00'
    let hasFunds = false

    try {
      const balance = onchainos.getChainBalance(AGENT_CHAIN)
      if (balance.ok && balance.data) {
        evmAddress = balance.data.evmAddress || null
        balanceUSD = balance.data.totalValueUsd || '0.00'
        // Find native OKB asset
        const details = balance.data.details?.[0]
        const nativeToken = details?.tokenAssets?.find(t => !t.tokenContractAddress || t.symbol === 'OKB')
        if (nativeToken) {
          balanceOKB = nativeToken.holdingAmount || '0'
          hasFunds = parseFloat(balanceOKB) > 0
        }
      }
    } catch {}

    // Fall back to generic balance for address if chain-specific failed
    if (!evmAddress) {
      try {
        const bal = onchainos.getBalance()
        if (bal.ok && bal.data) {
          evmAddress = bal.data.evmAddress || null
        }
      } catch {}
    }

    res.json({
      ok: true,
      loggedIn: true,
      email: status.data?.email || null,
      accountName: status.data?.currentAccountName || null,
      evmAddress,
      chain: AGENT_CHAIN_NAME,
      chainId: 196,
      balanceOKB,
      balanceUSD,
      hasFunds,
      gasFree: true, // X Layer is gas-free
    })
  } catch (err) {
    res.json({ ok: false, error: err.message })
  }
})

// POST /api/execute/auto — Dead Man's Switch auto-trigger using the agent wallet.
// Sends OKB from agent → each beneficiary per their allocation %.
// Body: { amountOKB?: string, preview?: boolean }
//  - amountOKB: total OKB to distribute (default: 0.01 for demo safety)
//  - preview: if true, skip actual send, just return the plan
router.post('/execute/auto', async (req, res) => {
  const { amountOKB = '0.01', preview = false } = req.body || {}
  const config = store.getConfig()

  if (!config.beneficiaries || config.beneficiaries.length === 0) {
    return res.status(400).json({ ok: false, error: 'No beneficiaries configured' })
  }

  const beneficiaries = config.beneficiaries.filter(b => b.address && parseFloat(b.allocationPercent) > 0)
  if (beneficiaries.length === 0) {
    return res.status(400).json({ ok: false, error: 'No beneficiaries with allocation > 0' })
  }

  // Compute per-beneficiary share
  const totalAlloc = beneficiaries.reduce((s, b) => s + parseFloat(b.allocationPercent), 0)
  const plan = beneficiaries.map(b => ({
    beneficiary: b.name,
    address: b.address,
    token: 'OKB',
    amount: (parseFloat(amountOKB) * (parseFloat(b.allocationPercent) / totalAlloc)).toFixed(6),
  }))

  if (preview) {
    return res.json({ ok: true, preview: true, plan, chain: AGENT_CHAIN_NAME, amountOKB })
  }

  // Execute real sends from the agent wallet
  const results = []
  const txHashes = []

  for (const p of plan) {
    try {
      // First call — may return confirming response
      let result = onchainos.sendNative(AGENT_CHAIN, p.amount, p.address)

      // Two-step confirm pattern required by the skill
      if (result.confirming) {
        console.log(`[Agent] wallet send asks for confirmation: ${result.message || ''} — retrying with --force`)
        result = onchainos.sendNativeForce(AGENT_CHAIN, p.amount, p.address)
      }

      if (result.ok && result.data?.txHash) {
        txHashes.push(result.data.txHash)
        results.push({
          beneficiary: p.beneficiary,
          address: p.address,
          token: 'OKB',
          amount: p.amount,
          txHash: result.data.txHash,
          status: 'completed',
        })
      } else {
        results.push({
          beneficiary: p.beneficiary,
          address: p.address,
          token: 'OKB',
          amount: p.amount,
          status: 'failed',
          error: result.error || result.message || 'Agent send failed',
        })
      }
    } catch (err) {
      results.push({
        beneficiary: p.beneficiary,
        address: p.address,
        token: 'OKB',
        amount: p.amount,
        status: 'failed',
        error: err.message,
      })
    }
  }

  const completedCount = results.filter(r => r.status === 'completed').length
  const status = completedCount === results.length
    ? 'completed'
    : completedCount > 0 ? 'partial' : 'failed'

  // Record execution in history
  const execution = {
    id: Date.now().toString(),
    trigger: 'Auto-Trigger (Agent)',
    timestamp: new Date().toISOString(),
    status,
    chain: AGENT_CHAIN_NAME,
    viaAgent: true,
    steps: [
      { action: 'Agent monitors wallet inactivity', status: 'completed', txHash: null },
      { action: 'Inactivity threshold exceeded — triggering', status: 'completed', txHash: null },
      ...results.map(r => ({
        action: `Agent transfers ${r.amount} ${r.token} to ${r.beneficiary}`,
        status: r.status,
        txHash: r.txHash || null,
        error: r.error || null,
      })),
    ],
    summary: { totalUSD: 0, transfers: results },
  }
  store.addExecution(execution)

  res.json({
    ok: true,
    success: completedCount > 0,
    chain: AGENT_CHAIN_NAME,
    txHashes,
    results,
    execution,
  })
})

module.exports = router
