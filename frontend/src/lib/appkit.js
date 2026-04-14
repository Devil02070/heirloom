import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { defineChain } from '@reown/appkit/networks'

export const projectId = 'ef0482d3c7df762922cfd273ed586c96'

// X Layer Testnet — chain 195
export const xLayerTestnet = defineChain({
  id: 195,
  caipNetworkId: 'eip155:195',
  chainNamespace: 'eip155',
  name: 'X Layer Testnet',
  nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testrpc.xlayer.tech'] },
  },
  blockExplorers: {
    default: { name: 'XLayer Scan', url: 'https://www.okx.com/web3/explorer/xlayer-test' },
  },
  testnet: true,
})

const metadata = {
  name: 'DeadSwitch',
  description: 'DeFi Inheritance & Emergency Protocol',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

export const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks: [xLayerTestnet],
  defaultNetwork: xLayerTestnet,
  projectId,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#FF2D20',
    '--w3m-font-family': 'inherit',
  },
})
