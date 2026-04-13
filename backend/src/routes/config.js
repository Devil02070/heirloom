const express = require('express')
const router = express.Router()
const store = require('../store')

// Get current configuration
router.get('/config', (req, res) => {
  res.json(store.getConfig())
})

// Save configuration
router.post('/config', (req, res) => {
  const { inactivityThresholdDays, targetStablecoin, beneficiaries, actions } = req.body

  // Validate beneficiary allocations
  if (beneficiaries && beneficiaries.length > 0) {
    const total = beneficiaries.reduce((sum, b) => sum + (b.allocationPercent || 0), 0)
    if (total > 100) {
      return res.status(400).json({ error: 'Total allocation cannot exceed 100%' })
    }
    for (const b of beneficiaries) {
      if (!b.address || !b.address.startsWith('0x')) {
        return res.status(400).json({ error: `Invalid address for ${b.name || 'unknown'}` })
      }
    }
  }

  store.saveConfig({
    inactivityThresholdDays: inactivityThresholdDays || 30,
    targetStablecoin: targetStablecoin || 'USDC',
    beneficiaries: beneficiaries || [],
    actions: actions || {},
  })

  res.json({ success: true })
})

module.exports = router
