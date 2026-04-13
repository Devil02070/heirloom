const express = require('express')
const router = express.Router()
const store = require('../store')

// Get execution history
router.get('/history', (req, res) => {
  res.json(store.getHistory())
})

module.exports = router
