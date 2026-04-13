const express = require('express')
const router = express.Router()
const store = require('../store')

// Execute: Scan DeFi positions
router.post('/execute/scan', (req, res) => {
  const portfolio = store.getPortfolio()
  res.json({
    success: true,
    step: 'scan',
    message: 'Scanned all DeFi positions',
    positions: portfolio.defiPositions.length,
    tokens: portfolio.tokens.length,
  })
})

// Execute: Withdraw DeFi positions
router.post('/execute/withdraw', (req, res) => {
  const portfolio = store.getPortfolio()
  // In production, this calls okx-defi-invest to withdraw
  res.json({
    success: true,
    step: 'withdraw',
    message: `Withdrew ${portfolio.defiPositions.length} DeFi positions`,
    txHashes: [],
  })
})

// Execute: Swap to stablecoins
router.post('/execute/swap', (req, res) => {
  const config = store.getConfig()
  const portfolio = store.getPortfolio()
  // In production, this calls okx-dex-swap
  res.json({
    success: true,
    step: 'swap',
    message: `Swapping all tokens to ${config.targetStablecoin}`,
    tokensSwapped: portfolio.tokens.filter(t => !['USDC', 'USDT'].includes(t.symbol)).length,
    txHashes: [],
  })
})

// Execute: Transfer to beneficiaries
router.post('/execute/transfer', (req, res) => {
  const config = store.getConfig()

  // Record execution in history
  store.addExecution({
    id: Date.now().toString(),
    trigger: 'Panic Button',
    timestamp: new Date().toISOString(),
    status: 'completed',
    steps: [
      { action: 'Scan DeFi Positions', status: 'completed', txHash: null },
      { action: 'Withdraw DeFi Positions', status: 'completed', txHash: null },
      { action: 'Swap to Stablecoins', status: 'completed', txHash: null },
      { action: 'Transfer to Beneficiaries', status: 'completed', txHash: null },
    ],
    summary: {
      totalUSD: store.getPortfolio().totalValueUSD,
      beneficiaries: config.beneficiaries.map(b => ({
        name: b.name,
        address: b.address,
        percent: b.allocationPercent,
      })),
    },
  })

  res.json({
    success: true,
    step: 'transfer',
    message: `Transferred to ${config.beneficiaries.length} beneficiaries`,
    txHashes: [],
  })
})

module.exports = router
