import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { BrowserProvider, formatEther, formatUnits, Contract } from 'ethers'
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
  useAppKitNetwork,
  useDisconnect,
  useWalletInfo,
} from '@reown/appkit/react'
import { xLayerTestnet } from '../lib/appkit'

const WalletContext = createContext()

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
]

// Known tokens per chain — scan these for balances
const KNOWN_TOKENS = {
  195: [], // X Layer Testnet — native OKB only
  196: [
    { address: '0xA8CE8aee21bC2A48a5EF670afCc9274C7bbbC035', symbol: 'USDC', decimals: 6 },
    { address: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d', symbol: 'USDT', decimals: 6 },
    { address: '0xe538905cf8410324e03A5A23C1c177a474D59b2b', symbol: 'OKB', decimals: 18 },
    { address: '0x5A77f1443D16ee5761d310e38b62f77f726bC71c', symbol: 'WETH', decimals: 18 },
  ],
}

const CHAIN_INFO = {
  195: { name: 'X Layer Testnet', nativeSymbol: 'OKB', nativeName: 'OKB' },
  196: { name: 'X Layer', nativeSymbol: 'OKB', nativeName: 'OKB' },
}

async function fetchPrices() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=okb&vs_currencies=usd')
    if (!res.ok) throw new Error('Price fetch failed')
    const data = await res.json()
    return { OKB: data.okb?.usd || 50, USDC: 1, USDT: 1 }
  } catch {
    return { OKB: 50, USDC: 1, USDT: 1 }
  }
}

export function WalletProvider({ children }) {
  // Reown AppKit hooks
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const { chainId, switchNetwork } = useAppKitNetwork()
  const { disconnect: appKitDisconnect } = useDisconnect()
  const { walletInfo } = useWalletInfo()

  // Local state for derived data
  const [balance, setBalance] = useState(null)
  const [tokens, setTokens] = useState([])
  const [prices, setPrices] = useState({})
  const [nativePrice, setNativePrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [txCount, setTxCount] = useState(null)
  const [lastActivityAt, setLastActivityAt] = useState(null)
  const [error, setError] = useState(null)

  // Ethers provider wrapping the Reown walletProvider
  const ethersProvider = useMemo(() => {
    if (!walletProvider) return null
    try {
      return new BrowserProvider(walletProvider, chainId ? Number(chainId) : undefined)
    } catch {
      return null
    }
  }, [walletProvider, chainId])

  const providerRef = useRef(null)
  useEffect(() => { providerRef.current = ethersProvider }, [ethersProvider])

  // Track wallet activity via nonce changes in localStorage
  const trackActivity = useCallback((addr, nonce) => {
    if (!addr || nonce == null) return
    const key = `heirloom-activity-${addr.toLowerCase()}`
    const now = new Date().toISOString()

    const demoOverride = localStorage.getItem('heirloom-activity-demo')
    if (demoOverride) {
      setLastActivityAt(demoOverride)
      return
    }

    let stored = null
    try { stored = JSON.parse(localStorage.getItem(key) || 'null') } catch {}

    if (!stored) {
      localStorage.setItem(key, JSON.stringify({ nonce, at: now }))
      setLastActivityAt(now)
    } else if (nonce > stored.nonce) {
      localStorage.setItem(key, JSON.stringify({ nonce, at: now }))
      setLastActivityAt(now)
    } else {
      setLastActivityAt(stored.at)
    }
  }, [])

  const refreshBalances = useCallback(async (addr) => {
    const target = addr || address
    const prov = providerRef.current
    if (!prov || !target) return

    setLoading(true)
    try {
      const [priceRes, balRes, nonceRes] = await Promise.allSettled([
        fetchPrices(),
        prov.getBalance(target),
        prov.getTransactionCount(target),
      ])

      const priceMap = priceRes.status === 'fulfilled' ? priceRes.value : { OKB: 50, USDC: 1, USDT: 1 }
      const bal = balRes.status === 'fulfilled' ? balRes.value : 0n
      const nonce = nonceRes.status === 'fulfilled' ? nonceRes.value : null

      setPrices(priceMap)
      setTxCount(nonce)
      trackActivity(target, nonce)

      const chain = chainId ? Number(chainId) : null
      const chainInfo = CHAIN_INFO[chain] || { nativeSymbol: 'OKB' }
      const natPrice = priceMap[chainInfo.nativeSymbol] || 0

      setBalance(formatEther(bal))
      setNativePrice(natPrice)

      // Scan known ERC20s
      const knownTokens = KNOWN_TOKENS[chain] || []
      const tokenResults = await Promise.allSettled(
        knownTokens.map(async (token) => {
          const contract = new Contract(token.address, ERC20_ABI, prov)
          const rawBal = await contract.balanceOf(target)
          const formatted = formatUnits(rawBal, token.decimals)
          if (parseFloat(formatted) <= 0) return null

          let tokenName = token.symbol
          try { tokenName = await contract.name() } catch {}

          const price = priceMap[token.symbol] || 0
          return {
            address: token.address,
            symbol: token.symbol,
            name: tokenName,
            decimals: token.decimals,
            balance: formatted,
            priceUSD: price,
            valueUSD: parseFloat(formatted) * price,
          }
        })
      )

      const validTokens = tokenResults
        .filter(r => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value)

      setTokens(validTokens)
    } catch (err) {
      console.error('Failed to fetch balances:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [address, chainId, trackActivity])

  // Refresh balances whenever connection or chain changes
  useEffect(() => {
    if (isConnected && address && ethersProvider) {
      refreshBalances(address)
    } else {
      setBalance(null)
      setTokens([])
      setTxCount(null)
      setLastActivityAt(null)
    }
  }, [isConnected, address, ethersProvider, refreshBalances])

  // Open the Reown connect modal
  const connectWallet = useCallback(() => {
    setError(null)
    open()
  }, [open])

  const disconnect = useCallback(async () => {
    try {
      await appKitDisconnect()
    } catch {}
    setBalance(null)
    setTokens([])
    setTxCount(null)
    setLastActivityAt(null)
    setError(null)
  }, [appKitDisconnect])

  // Get an ethers signer on demand (avoids state-sync issues)
  const getSigner = useCallback(async () => {
    if (!ethersProvider) throw new Error('Wallet not connected')
    return await ethersProvider.getSigner()
  }, [ethersProvider])

  const sendNative = useCallback(async (to, amountEther) => {
    const signer = await getSigner()
    return await signer.sendTransaction({
      to,
      value: BigInt(Math.floor(parseFloat(amountEther) * 1e18)),
    })
  }, [getSigner])

  const sendToken = useCallback(async (tokenAddress, to, amount, decimals = 18) => {
    const signer = await getSigner()
    const contract = new Contract(tokenAddress, ERC20_ABI, signer)
    const parsedAmount = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals)))
    return await contract.transfer(to, parsedAmount)
  }, [getSigner])

  const switchToXLayerTestnet = useCallback(async () => {
    try {
      await switchNetwork(xLayerTestnet)
    } catch (err) {
      console.error('Network switch failed:', err)
    }
  }, [switchNetwork])

  const setDemoInactivity = useCallback((days) => {
    if (days == null || days < 0) {
      localStorage.removeItem('heirloom-activity-demo')
      if (address) {
        const key = `heirloom-activity-${address.toLowerCase()}`
        localStorage.removeItem(key)
        refreshBalances(address)
      }
      return
    }
    const at = new Date(Date.now() - days * 86400000).toISOString()
    localStorage.setItem('heirloom-activity-demo', at)
    setLastActivityAt(at)
  }, [address, refreshBalances])

  // Create async signer promise so PanicButton can await it
  const [signer, setSigner] = useState(null)
  useEffect(() => {
    if (ethersProvider) {
      ethersProvider.getSigner().then(setSigner).catch(() => setSigner(null))
    } else {
      setSigner(null)
    }
  }, [ethersProvider])

  // Derived values
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null
  const numericChainId = chainId ? Number(chainId) : null
  const chainInfo = CHAIN_INFO[numericChainId] || { name: `Chain ${numericChainId}`, nativeSymbol: 'OKB', nativeName: 'OKB' }
  const nativeBalanceUSD = parseFloat(balance || 0) * nativePrice
  const tokensTotalUSD = tokens.reduce((sum, t) => sum + (t.valueUSD || 0), 0)
  const totalValueUSD = nativeBalanceUSD + tokensTotalUSD
  const daysSinceActivity = lastActivityAt
    ? Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86400000)
    : null

  return (
    <WalletContext.Provider value={{
      // State
      address,
      shortAddress,
      chainId: numericChainId,
      chainInfo,
      balance,
      nativePrice,
      nativeBalanceUSD,
      tokens,
      tokensTotalUSD,
      totalValueUSD,
      prices,
      txCount,
      lastActivityAt,
      daysSinceActivity,
      provider: ethersProvider,
      signer,
      walletProvider, // raw EIP-1193 provider from Reown (bypass ethers for stubborn wallets)
      walletInfo, // { name, icon } of the actually connected wallet
      providerName: walletInfo?.name || 'Wallet',
      connecting: false,
      loading,
      error,
      isConnected,
      // Actions
      connectWallet,
      disconnect,
      refreshBalances: () => refreshBalances(address),
      sendNative,
      sendToken,
      switchToXLayerTestnet,
      setDemoInactivity,
      getSigner,
      openAppKit: open,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
