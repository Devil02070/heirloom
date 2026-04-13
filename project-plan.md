# DeadSwitch — Project Plan
## DeFi Inheritance & Emergency Protocol

**Hackathon:** Build X Season 2 — X Layer Arena
**Deadline:** Apr 15, 2026, 23:59 UTC (~2 days)
**Team:** Human + AI collaboration (25% of rubric)

---

## 1. Problem Statement

$140B+ in crypto is estimated permanently lost. When a wallet holder is incapacitated or loses access,
their Uniswap LP positions, Aave loans, lending positions, and tokens are frozen forever.
There is no on-chain "will" or inheritance mechanism.

## 2. Solution — DeadSwitch

An AI agent that monitors wallet inactivity and automatically executes a user-configured
emergency plan: withdrawing DeFi positions, swapping to stablecoins, and transferring to beneficiaries.

**Two modes:**
- **Dead Man's Switch** — triggers after configurable inactivity period (e.g., 30 days no TX)
- **Panic Button** — instant manual trigger to liquidate everything to stablecoins now

---

## 3. Hard Requirements Checklist

- [ ] Deploy on X Layer mainnet (real TX hash)
- [ ] Use at least one Onchain OS skill
- [ ] Register Agentic Wallet
- [ ] Public GitHub repo with README
- [ ] Submit via Google Form by Apr 15 23:59 UTC

---

## 4. Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Frontend     | React + Vite + TailwindCSS              |
| Backend      | Node.js + Express                       |
| Agent Engine | OKX OnchainOS Skills (via Claude Code)  |
| Blockchain   | X Layer mainnet                         |
| State        | Local JSON file (hackathon scope)       |

---

## 5. Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (React)                │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Config  │ │ Dashboard│ │ Panic Button │  │
│  │ Panel   │ │ (Status) │ │   (Red!)     │  │
│  └────┬────┘ └────┬─────┘ └──────┬───────┘  │
│       └───────────┼──────────────┘           │
└───────────────────┼──────────────────────────┘
                    │ REST API
┌───────────────────┼──────────────────────────┐
│              Backend (Express)                │
│  ┌────────────────┼────────────────────────┐ │
│  │         Agent Controller                │ │
│  │  ┌─────────┐ ┌┴────────┐ ┌───────────┐ │ │
│  │  │Monitor  │ │Executor │ │ Config    │ │ │
│  │  │Service  │ │Service  │ │ Manager   │ │ │
│  │  └────┬────┘ └────┬────┘ └───────────┘ │ │
│  └───────┼──────────┼─────────────────────┘ │
└──────────┼──────────┼───────────────────────┘
           │          │
┌──────────┼──────────┼───────────────────────┐
│     OKX OnchainOS Skills Layer               │
│                                              │
│  okx-agentic-wallet  — wallet auth, send TX  │
│  okx-wallet-portfolio — scan token balances   │
│  okx-defi-portfolio   — scan DeFi positions   │
│  okx-defi-invest      — withdraw positions    │
│  okx-dex-swap         — swap to stablecoins   │
│  okx-security         — revoke approvals      │
│                                              │
│              X Layer Mainnet                 │
└──────────────────────────────────────────────┘
```

---

## 6. Implementation Plan

### Phase 1: Project Setup & Wallet Registration (30 min)
1. Initialize git repo
2. Run `npx skills add okx/onchainos-skills`
3. Set up project structure (frontend + backend)
4. Install dependencies (react, vite, tailwind, express)
5. Register Agentic Wallet using `okx-agentic-wallet` skill

### Phase 2: Backend — Config & Monitoring Engine (2-3 hrs)
1. **Config Manager** — CRUD API for emergency plans
   - POST /api/config — save plan (beneficiaries, timeout, actions)
   - GET /api/config — retrieve current plan
   - Stores: beneficiary addresses, allocation %, inactivity timeout, enabled actions
   
2. **Monitor Service** — wallet activity checker
   - Uses `okx-agentic-wallet` to check last TX timestamp
   - Uses `okx-wallet-portfolio` to get current holdings/value
   - Compares inactivity duration vs configured threshold
   - Returns status: ACTIVE / WARNING / TRIGGERED
   
3. **Executor Service** — the emergency plan runner
   - Step 1: Scan all DeFi positions (`okx-defi-portfolio`)
   - Step 2: Withdraw all DeFi positions (`okx-defi-invest`)
   - Step 3: Swap all non-stable tokens to USDC/USDT (`okx-dex-swap`)
   - Step 4: Revoke unnecessary approvals (`okx-security`)
   - Step 5: Transfer stablecoins to beneficiaries by allocation % (`okx-agentic-wallet`)
   - Each step logs TX hash for audit trail

4. **API Routes**
   - GET  /api/status — current monitoring status
   - POST /api/panic — trigger immediate liquidation (panic button)
   - GET  /api/history — execution history & TX hashes
   - GET  /api/portfolio — current wallet overview

### Phase 3: Frontend — Dashboard UI (2-3 hrs)
1. **Configuration Page**
   - Add/remove beneficiaries (address + name + allocation %)
   - Set inactivity timeout (days slider)
   - Toggle which actions to include (withdraw DeFi, swap, transfer)
   - Save/update configuration

2. **Dashboard Page**
   - Wallet connection status
   - Current portfolio value (tokens + DeFi positions)
   - Inactivity timer (days since last TX / threshold)
   - Status indicator (green=active, yellow=warning, red=triggered)
   - Execution history log with TX hashes

3. **Panic Button**
   - Big red button component
   - Confirmation modal ("Are you sure? This will liquidate ALL positions")
   - Real-time execution progress (step 1/5, step 2/5, etc.)

### Phase 4: Integration & Demo TX (1-2 hrs)
1. Connect frontend to backend APIs
2. Test full flow with Agentic Wallet on X Layer
3. Execute a real panic liquidation demo on X Layer mainnet
4. Capture TX hash for submission
5. Verify funds arrive at beneficiary address

### Phase 5: Polish & Submit (1 hr)
1. Write README.md (problem, solution, demo, architecture, TX proof)
2. Push to public GitHub repo
3. Record demo video/screenshots if needed
4. Submit via Google Form before Apr 15 23:59 UTC

---

## 7. Emergency Plan Execution Flow (Detail)

```
TRIGGER (inactivity timeout OR panic button)
    │
    ▼
[1] SCAN — okx-defi-portfolio
    │   Discover all DeFi positions (LP, lending, staking)
    ▼
[2] WITHDRAW — okx-defi-invest
    │   Withdraw/redeem all DeFi positions back to wallet
    ▼
[3] CONSOLIDATE — okx-wallet-portfolio + okx-dex-swap
    │   Check all token balances
    │   Swap every non-stable token → USDC via best route
    ▼
[4] SECURE — okx-security
    │   Revoke all unnecessary token approvals
    ▼
[5] DISTRIBUTE — okx-agentic-wallet
    │   Transfer USDC to each beneficiary per allocation %
    │   Log all TX hashes
    ▼
[DONE] — All assets distributed. Execution report generated.
```

---

## 8. Data Model

```json
{
  "config": {
    "ownerAddress": "0x...",
    "inactivityThresholdDays": 30,
    "beneficiaries": [
      {
        "name": "Alice",
        "address": "0xABC...",
        "allocationPercent": 60
      },
      {
        "name": "Bob",
        "address": "0xDEF...",
        "allocationPercent": 40
      }
    ],
    "actions": {
      "withdrawDefi": true,
      "swapToStable": true,
      "revokeApprovals": true,
      "transferToBeneficiaries": true
    },
    "targetStablecoin": "USDC"
  },
  "status": {
    "lastActivityTimestamp": "2026-04-01T12:00:00Z",
    "daysSinceActivity": 12,
    "state": "ACTIVE | WARNING | TRIGGERED",
    "portfolioValueUSD": 15000,
    "executionHistory": []
  }
}
```

---

## 9. Key Demo Scenario

For the hackathon demo on X Layer:

1. Show wallet with some tokens and/or a DeFi position
2. Show the configured emergency plan (beneficiary + timeout)
3. Hit the **Panic Button**
4. Watch the agent execute: scan → withdraw → swap → transfer
5. Show the real TX hashes on X Layer explorer
6. Show the beneficiary wallet received the funds

This proves the full flow works on mainnet with real transactions.

---

## 10. Risk Mitigation

| Risk                          | Mitigation                                    |
|-------------------------------|-----------------------------------------------|
| Wallet auth issues            | Register wallet early in Phase 1              |
| No DeFi positions to demo     | Use simple token swap + transfer as fallback  |
| Swap slippage on X Layer      | Use small amounts for demo, set slippage 1%   |
| Time crunch                   | Panic button demo alone is a valid MVP        |
| Skill API failures            | Build with graceful error handling per step    |

---

## Priority Order (if time is tight)

1. **Must have:** Wallet registration + panic button that swaps & transfers (core demo)
2. **Should have:** Config UI for beneficiaries + inactivity monitoring
3. **Nice to have:** DeFi position scanning + withdrawal, approval revocation
4. **Stretch:** Auto-trigger on real inactivity timer, execution progress UI
