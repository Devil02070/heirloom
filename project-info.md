 "DeadSwitch" -- DeFi Inheritance & Emergency Protocol

  Problem: $140B+ in crypto is estimated to be permanently lost. If you're incapacitated, your Uniswap LP positions,
  Aave loans, and wallet tokens are frozen forever. No on-chain "will" exists.

  What it does:
  - User configures: beneficiary addresses, inactivity timeout (e.g., 30 days), emergency actions
  - Agent monitors wallet activity (last TX timestamp)
  - When inactivity threshold is reached, executes the emergency plan:
    - Withdraws all Uniswap V3 LP positions
    - Swaps everything to USDT/USDC via DEX aggregator
    - Transfers to beneficiary wallets
  - Optional: "panic button" mode -- instantly liquidate everything to stablecoins

  Skills used:
  - okx-agentic-wallet -- activity monitoring, send, history
  - okx-defi-invest -- withdraw all DeFi positions
  - okx-defi-portfolio -- scan all positions across protocols
  - okx-dex-swap -- swap everything to stablecoins
  - okx-wallet-portfolio -- track total value
  - okx-security -- approval management (revoke unnecessary approvals)

  Why it's unique: Completely non-trading use case. Solves a real, unsolved, high-value problem. No Season 1 project
  touched inheritance/estate planning.

  1-day scope: Web UI to configure beneficiary + timeout + emergency plan. Agent backend that monitors and can execute
  the plan. Demo with a real "panic liquidation" TX on X Layer.

  ---