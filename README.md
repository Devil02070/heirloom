# DeadSwitch

**DeFi Inheritance & Emergency Protocol** — an AI agent that monitors wallet inactivity and, when triggered, liquidates all positions to stablecoins and distributes them to configured beneficiaries.

Built for [Build X Season 2 — X Layer Arena](https://www.okx.com/xlayer/) hackathon.

---

## The problem

$140B+ in crypto is estimated permanently lost. If a wallet holder is incapacitated or loses access, their Uniswap LP positions, Aave loans, staked tokens, and holdings are frozen forever. **There is no on-chain "will" for DeFi positions.**

## The solution

DeadSwitch lets a user configure an emergency plan once:

1. **Beneficiary list** — addresses + allocation percentages
2. **Inactivity threshold** — e.g. 30 days without any wallet TX
3. **Emergency actions** — withdraw DeFi positions, swap to stablecoins, transfer to beneficiaries

Two trigger modes:

- **Dead Man's Switch** — auto-fires after the inactivity threshold is exceeded
- **Panic Button** — manual instant liquidation

When triggered, the agent scans balances, swaps everything to the target stablecoin, and distributes to beneficiaries — all on-chain, with TX hashes captured for audit.

---

## Demo flow

1. Connect wallet via **Reown AppKit** (supports OKX Wallet, MetaMask, WalletConnect — any EIP-6963 wallet)
2. Auto-switches network to **X Layer Testnet** (chain 195)
3. Configure page: add beneficiaries + allocation %
4. Dashboard: see live OKB balance, inactivity timer, portfolio value
5. Panic Button → Confirm → real TX signed by your wallet transfers 50% of balance to beneficiaries
6. History page: every execution logged with TX hash links to X Layer Explorer

The **Inactivity Monitor** tracks real wallet activity by comparing the on-chain nonce against a local snapshot. A built-in Demo slider lets you simulate N days of inactivity for live presentations.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (React + Vite)        │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Config  │ │ Dashboard│ │ Panic Button │  │
│  └────┬────┘ └────┬─────┘ └──────┬───────┘  │
│       │           │              │           │
│    TanStack Query cache + Reown AppKit       │
└───────────────────┼──────────────────────────┘
                    │
┌───────────────────┼──────────────────────────┐
│           Backend (Express)                   │
│  GET/POST /api/config                         │
│  GET      /api/status   (inactivity monitor)  │
│  GET      /api/portfolio                      │
│  POST     /api/execute/scan|withdraw|swap     │
│  POST     /api/execute/record (record TX run) │
│  GET      /api/history                        │
└───────────────────┼──────────────────────────┘
                    │
                    ▼
          X Layer Testnet (OKB native)
          + OKX OnchainOS skills
```

---

## Tech stack

| Layer         | Technology                                           |
|---------------|------------------------------------------------------|
| Wallet UX     | **Reown AppKit** (ethers adapter) — multi-wallet modal |
| Frontend      | React 19 + Vite 6 + Tailwind v4 + Framer Motion      |
| Data layer    | **TanStack Query** (useQuery / useMutation)          |
| Chain client  | **ethers v6** (BrowserProvider wrapping Reown)       |
| Backend       | Node.js + Express                                    |
| Blockchain    | X Layer Testnet (chain 195, native OKB)              |
| Skills layer  | OKX OnchainOS (agentic-wallet, dex-swap, defi-invest, wallet-portfolio, security) |
| State         | Local JSON files in `backend/data/` (hackathon scope)|

---

## OKX OnchainOS skills used

- `okx-agentic-wallet` — wallet auth, activity history, send TX
- `okx-wallet-portfolio` — scan token balances + USD values
- `okx-defi-portfolio` — enumerate DeFi positions across protocols
- `okx-defi-invest` — withdraw LP / lending positions
- `okx-dex-swap` — swap non-stables to USDC / USDT
- `okx-security` — revoke unnecessary token approvals

---

## Key design decisions

- **Panic button signs from the user's connected wallet** (not a server key). The transfer is a real `eth_sendTransaction` through the Reown walletProvider — no custodial backend wallet.
- **50% transfer rule** — reserves 50% of native balance for gas. This is intentionally generous: X Layer Testnet's gas price reporting can be unstable, and OKX Wallet's pre-simulator refuses TXs with tight balance margins. A large reserve guarantees the TX ships.
- **Self-send detection** — beneficiaries matching the sender's own address are filtered out (wallets reject `from == to`).
- **Nonce-based activity tracking** — the Inactivity Monitor polls the connected wallet's transaction count. If it's unchanged since the last poll, `lastActivityAt` is preserved; if it increased, `lastActivityAt` jumps to now. Reliable, on-chain-truth signal without needing an explorer API key.
- **TanStack Query caching** — `/api/config`, `/api/status`, `/api/portfolio` are cached with a 10s stale time, deduped across Dashboard/Configure/History, and auto-refetch on window focus.

---

## Project structure

```
DeadSwitch/
├── backend/
│   ├── data/              # JSON persistence: config, status, portfolio, history
│   └── src/
│       ├── server.js      # Express app entry
│       ├── routes/        # config, status, portfolio, execute, history, wallet
│       ├── store.js       # JSON read/write helpers
│       └── onchainos.js   # OKX OnchainOS CLI wrapper (server-side skills)
├── frontend/
│   └── src/
│       ├── App.jsx        # Top-level routing via view/page state
│       ├── lib/appkit.js  # Reown AppKit init (projectId + X Layer Testnet)
│       ├── context/
│       │   └── WalletContext.jsx  # Reown hooks + balance/token scan
│       ├── hooks/useApi.js        # TanStack Query wrapper
│       ├── components/
│       │   ├── PanicButton.jsx    # Real on-chain liquidation flow
│       │   ├── InactivityTimer.jsx
│       │   ├── Sidebar.jsx
│       │   └── WalletButton.jsx
│       └── pages/
│           ├── Landing.jsx
│           ├── Dashboard.jsx
│           ├── Configure.jsx
│           └── History.jsx
├── nixpacks.toml          # Railway build config
├── railway.json
└── package.json           # Root — monorepo scripts
```

---

## Local development

### Prerequisites

- Node.js 22+
- An EIP-6963 wallet (OKX Wallet or MetaMask)
- Some test OKB on **X Layer Testnet** — get it from the [X Layer faucet](https://www.okx.com/xlayer/faucet)

### Setup

```bash
# Install all deps (frontend + backend)
npm run install:all

# Run both servers concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Using the app

1. Click **Connect Wallet** → pick your wallet in the Reown modal
2. Approve the X Layer Testnet network add / switch
3. Go to **Configure** → add at least one beneficiary address (different from your own)
4. Go to **Dashboard** → you'll see your real OKB balance
5. Click **Panic Button** → **Confirm Liquidation** → approve the TX in your wallet
6. Watch the TX hash appear with a link to X Layer Testnet explorer
7. Check **History** to see the execution recorded

---

## Deployment

The project is configured for **Railway** via `nixpacks.toml`:

```bash
# Build the frontend
npm run build

# Start the production server (serves frontend/dist + Express API)
npm start
```

The Express server serves the built SPA from `frontend/dist` at the root and handles `/api/*` routes.

---

## Submission details (Build X Season 2)

- **Hackathon:** Build X Season 2 — X Layer Arena
- **Deadline:** Apr 15, 2026, 23:59 UTC
- **Demo TX:** *(capture panic-liquidation TX hash and add here)*
- **Live demo:** *(deployed URL)*

### Registered Agentic Wallet

| Field | Value |
|---|---|
| Email | `ajaykumar.builds@gmail.com` |
| EVM Address | `0x67ba9ccf8e43bb2470b5fa7a966bbfdd90688c1c` |
| Solana Address | `7RUQLoAtzbM2U1Q9ph1HR8N35ztGAKedX7kYnuDve8XN` |

The EVM address supports X Layer, Ethereum, Polygon, and all other EVM-compatible chains.

---

## License

MIT
