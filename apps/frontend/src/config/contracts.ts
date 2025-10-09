export const TRUSTLESS_TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TRUSTLESS_TREASURY_ADDRESS ?? '';

export const trustlessTreasuryAbi = [
  {
    type: 'function',
    name: 'grantDelegation',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'aiAgent', type: 'address' },
      { name: 'dailyLimitUSD', type: 'uint256' },
      { name: 'allowedProtocols', type: 'address[]' },
      { name: 'validUntil', type: 'uint256' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'updateDelegation',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'dailyLimitUSD', type: 'uint256' },
      { name: 'allowedProtocols', type: 'address[]' },
      { name: 'validUntil', type: 'uint256' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'revokeDelegation',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'emergencyStop',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'resumeDelegation',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'validUntil', type: 'uint256' }
    ],
    outputs: []
  }
] as const;
