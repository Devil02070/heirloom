const express = require('express')
const router = express.Router()
const store = require('../store')

// Get portfolio overview
router.get('/portfolio', (req, res) => {
  res.json(store.getPortfolio())
})

// Update portfolio data (called by agent or manually)
router.post('/portfolio', (req, res) => {
  store.savePortfolio(req.body)
  res.json({ success: true })
})

module.exports = router
