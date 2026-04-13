const express = require('express')
const router = express.Router()
const store = require('../store')

// Get current monitoring status
router.get('/status', (req, res) => {
  res.json(store.getStatus())
})

// Manually update last activity (for testing/demo)
router.post('/status/activity', (req, res) => {
  store.saveStatus({
    lastActivityTimestamp: new Date().toISOString(),
  })
  res.json({ success: true, message: 'Activity timestamp updated' })
})

module.exports = router
