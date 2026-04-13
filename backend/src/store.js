const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')

function readJSON(filename, fallback = null) {
  const filePath = path.join(DATA_DIR, filename)
  try {
    if (!fs.existsSync(filePath)) return fallback
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return fallback
  }
}

function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

const DEFAULT_CONFIG = {
  inactivityThresholdDays: 30,
  targetStablecoin: 'USDC',
  beneficiaries: [],
  actions: {
    withdrawDefi: true,
    swapToStable: true,
    revokeApprovals: true,
    transferToBeneficiaries: true,
  },
}

const DEFAULT_STATUS = {
  lastActivityTimestamp: new Date().toISOString(),
  daysSinceActivity: 0,
  state: 'ACTIVE',
}

module.exports = {
  getConfig: () => readJSON('config.json', DEFAULT_CONFIG),
  saveConfig: (config) => writeJSON('config.json', { ...DEFAULT_CONFIG, ...config }),

  getStatus: () => {
    const status = readJSON('status.json', DEFAULT_STATUS)
    const lastActivity = new Date(status.lastActivityTimestamp)
    const now = new Date()
    const daysSince = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24))
    const config = readJSON('config.json', DEFAULT_CONFIG)
    const threshold = config.inactivityThresholdDays || 30

    let state = 'ACTIVE'
    if (daysSince >= threshold) state = 'TRIGGERED'
    else if (daysSince >= threshold * 0.7) state = 'WARNING'

    return { ...status, daysSinceActivity: daysSince, state }
  },
  saveStatus: (status) => writeJSON('status.json', status),

  getHistory: () => readJSON('history.json', { executions: [] }),
  addExecution: (execution) => {
    const history = readJSON('history.json', { executions: [] })
    history.executions.unshift(execution)
    writeJSON('history.json', history)
  },

  getPortfolio: () => readJSON('portfolio.json', {
    totalValueUSD: 0,
    tokens: [],
    defiPositions: [],
  }),
  savePortfolio: (portfolio) => writeJSON('portfolio.json', portfolio),
}
