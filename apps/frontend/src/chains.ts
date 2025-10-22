import { defineChain } from 'viem'

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON'
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz']
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz']
    }
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://explorer.testnet.monad.xyz' }
  },
  contracts: {
    // ERC-4337 EntryPoint (standard v0.7)
    entryPoint: {
      address: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
    },
    // MetaMask Delegation Framework (deployed 2025-01-14)
    delegationManager: {
      address: '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a'
    },
    hybridDeleGator: {
      address: '0x0fb901F876C65d4cc2491Cd2a0be8117E159dFee'
    },
    multiSigDeleGator: {
      address: '0xf698BA413575B77a056ec6bbEb61d2e54F2e8050'
    }
  },
  testnet: true
})
