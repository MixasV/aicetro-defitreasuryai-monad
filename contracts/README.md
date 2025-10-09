# Aicetro Smart Contracts

> **Trustless AI-Powered Treasury Management for Corporate DeFi**

Aicetro enables corporate smart accounts to delegate limited treasury management permissions to AI agents **without introducing admin backdoors or trusted intermediaries**. All delegation rules are enforced on-chain, and users retain full control with instant emergency stop and revocation capabilities.

---

## 🏆 Built for Monad Builder's Cup

This project is submitted to the [Monad Builder's Cup Hackathon](https://monad.xyz/builders-cup) and utilizes the required technologies:
- ✅ **Monad Testnet** - Smart contracts deployed and verified on Chain ID 2814
- ✅ **OpenRouter** - Multi-provider AI integration (Claude, GPT-4, DeepSeek)
- ✅ **Envio** - Real-time blockchain indexing via HyperIndex GraphQL API

**Additional Technologies:**
- **RainbowKit + Wagmi** - Web3 wallet integration (MetaMask, WalletConnect, and more)
- **MetaMask SDK** - Enhanced MetaMask integration with delegation toolkit
- **Next.js 14** - Modern React framework for frontend
- **Hardhat** - Smart contract development and deployment

---

## 📋 Table of Contents

- [Overview](#overview)
- [Smart Contracts](#smart-contracts)
- [Key Features](#key-features)
- [Deployed Contracts](#deployed-contracts)
- [Architecture](#architecture)
- [Security Guarantees](#security-guarantees)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [License](#license)

---

## 🎯 Overview

Traditional DeFi treasury management requires either:
1. **Manual operations** - Time-consuming, requires 24/7 monitoring
2. **Multi-sig with AI** - Introduces trusted parties and delays
3. **Admin keys** - Centralization risk, potential for exploitation

**Aicetro's Solution:**
- ✅ **Trustless delegation** - AI agent has limited permissions granted by user
- ✅ **On-chain enforcement** - All limits and rules enforced by smart contracts
- ✅ **Zero admin keys** - No one (including team) can override user decisions
- ✅ **Instant revocation** - User can stop AI at any moment
- ✅ **Emergency stop** - One-click pause for any suspicious activity

---

## 📜 Smart Contracts

### Core Contracts

#### **1. TrustlessDeFiTreasury.sol**
Main delegation manager that enforces all trustless guarantees.

**Key Functions:**
```solidity
// Grant limited permissions to AI agent
function grantDelegation(
    address aiAgent,
    uint256 dailyLimitUSD,
    address[] calldata allowedProtocols,
    uint256 validUntil
) external;

// AI agent executes on behalf of user (within limits)
function executeForUser(
    address user,
    address protocol,
    bytes calldata data,
    uint256 amountUSD
) external;

// User instantly revokes all permissions
function revokeDelegation() external;

// User pauses AI agent immediately
function emergencyStop() external;
```

**Features:**
- Daily spending limits (reset every 24 hours)
- Protocol whitelist (only approved DeFi protocols)
- Time-based expiration (delegation auto-expires)
- Spent amount tracking (transparent usage)

---

#### **2. CorporateTreasuryManager.sol**
Multi-account management for institutional users.

**Key Functions:**
```solidity
// Create corporate account for delegation
function createAccount(
    string calldata name,
    address owner
) external returns (address);

// Get all accounts for an owner
function getAccountsByOwner(
    address owner
) external view returns (address[] memory);
```

**Features:**
- Multiple treasury accounts per institution
- Separate delegations per account
- Unified management interface

---

#### **3. EmergencyController.sol**
Additional security layer for emergency situations.

**Key Functions:**
```solidity
// Global emergency stop (user-controlled)
function triggerEmergency(address user) external;

// Check if account is in emergency mode
function isEmergency(address user) external view returns (bool);
```

**Features:**
- User-initiated emergency mode
- Cannot be triggered by admins or third parties
- Prevents all AI executions until user resolves

---

### Supporting Contracts

#### **4. AIAgentExecutor.sol**
Helper contract for AI agent transaction execution.

#### **5. ProtocolWhitelist.sol**
Manages approved DeFi protocols for delegation.

#### **6. RiskLimiter.sol**
Additional risk management and limit enforcement.

---

## ✨ Key Features

### 🔐 Trustless Architecture
- **Zero admin keys** - No one can override user decisions
- **On-chain enforcement** - All limits verified by smart contracts
- **User sovereignty** - Full control remains with account owner

### ⚡ Instant Control
- **Emergency stop** - One-click pause for suspicious activity
- **Instant revocation** - Remove all AI permissions immediately
- **Real-time monitoring** - Track every AI action on-chain

### 📊 Transparent Operations
- **Daily limit tracking** - See exactly how much AI has spent
- **Protocol whitelist** - Control which DeFi protocols AI can use
- **Time-based expiration** - Delegations automatically expire

### 🛡️ Risk Management
- **Daily spending caps** - Prevent excessive losses
- **Protocol restrictions** - Limit exposure to specific protocols
- **Automatic reset** - Limits refresh every 24 hours

---

## 🌐 Deployed Contracts (Monad Testnet)

| Contract | Address | Verified |
|----------|---------|----------|
| **TrustlessDeFiTreasury** | `0x98691ae190682dddBde3cd4c493B2249D2086E5B` | ✅ [View](https://testnet.monadscan.io/address/0x98691ae190682dddBde3cd4c493B2249D2086E5B) |
| **CorporateTreasuryManager** | `0x98691ae190682dddBde3cd4c493B2249D2086E5B` | ✅ [View](https://testnet.monadscan.io/address/0x98691ae190682dddBde3cd4c493B2249D2086E5B) |
| **EmergencyController** | `0x4BE4FE572bAce94aaFF05e4a0c03ff79212C20e5` | ✅ [View](https://testnet.monadscan.io/address/0x4BE4FE572bAce94aaFF05e4a0c03ff79212C20e5) |

**Network Details:**
- **Chain ID:** 2814 (Monad Testnet)
- **RPC URL:** `https://testnet-rpc.monad.xyz`
- **Block Explorer:** https://testnet.monadscan.io

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Smart Account                    │
│                  (Corporate Treasury)                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Grants Limited Delegation
                         ▼
┌─────────────────────────────────────────────────────────┐
│            TrustlessDeFiTreasury Contract               │
│                                                          │
│  • Daily Limit: $50,000                                 │
│  • Allowed Protocols: [Nabla, Lynx, Infinex]          │
│  • Valid Until: 30 days                                 │
│  • Emergency Stop: Active                               │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ AI Agent Executes (within limits)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  DeFi Protocols                         │
│                                                          │
│  • Nabla Finance (Lending)                             │
│  • Lynx (Yield Aggregator)                             │
│  • Infinex (Perps Trading)                             │
└─────────────────────────────────────────────────────────┘
```

**Flow:**
1. User grants delegation with specific limits
2. AI agent analyzes markets and generates recommendations
3. AI executes approved strategies (contract validates limits)
4. User monitors all actions and can stop/revoke at any time

---

## 🔒 Security Guarantees

### What Aicetro CANNOT Do:
- ❌ Override user decisions
- ❌ Bypass daily limits
- ❌ Use non-whitelisted protocols
- ❌ Continue after emergency stop
- ❌ Prevent user revocation
- ❌ Access funds after expiration

### What Users CAN Do:
- ✅ Revoke delegation instantly (1 transaction)
- ✅ Emergency stop (1 transaction)
- ✅ Change limits at any time
- ✅ Add/remove protocols
- ✅ Extend or shorten expiration
- ✅ Monitor all AI actions on-chain

### Verified Security Properties:
- ✅ **No admin keys** - Code is immutable
- ✅ **No upgradability** - No proxy patterns
- ✅ **No timelocks** - Instant user control
- ✅ **No multi-sig required** - Direct user actions
- ✅ **No off-chain dependencies** - Pure on-chain logic

---

## 🛠️ Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- [pnpm](https://pnpm.io/) v8+
- [Hardhat](https://hardhat.org/)

### Setup

```bash
# Clone the repository
git clone https://github.com/MixasV/aicetro-contracts.git
cd aicetro-contracts

# Install dependencies
pnpm install

# Compile contracts
pnpm hardhat compile
```

---

## 🚀 Usage

### Deploy to Monad Testnet

1. **Create `.env` file:**
```env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

2. **Deploy contracts:**
```bash
pnpm hardhat run scripts/deploy.ts --network monadTestnet
```

3. **Verify on MonadScan:**
```bash
pnpm hardhat verify --network monadTestnet <CONTRACT_ADDRESS>
```

---

### Grant Delegation (Example)

```javascript
const treasury = await ethers.getContractAt(
  'TrustlessDeFiTreasury',
  TREASURY_ADDRESS
);

// Grant AI agent permission for 30 days
await treasury.grantDelegation(
  AI_AGENT_ADDRESS,
  ethers.parseUnits("50000", 18), // $50K daily limit
  [NABLA_ADDRESS, LYNX_ADDRESS],  // Allowed protocols
  Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days
);
```

---

### Emergency Stop (Example)

```javascript
// Instantly pause AI agent
await treasury.emergencyStop();

// Or completely revoke delegation
await treasury.revokeDelegation();
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm hardhat test

# Run with gas reporting
REPORT_GAS=true pnpm hardhat test

# Run coverage
pnpm hardhat coverage
```

---

## 📊 Contract Sizes

| Contract | Size | Optimized |
|----------|------|-----------|
| TrustlessDeFiTreasury | ~10 KB | ✅ |
| CorporateTreasuryManager | ~4 KB | ✅ |
| EmergencyController | ~2 KB | ✅ |

All contracts are within the 24 KB deployment limit.

---

## 🔗 Related Links

- **Live Demo:** [Coming Soon]
- **Full Platform:** Private repository (backend + frontend)
- **Documentation:** See main project README
- **Hackathon Submission:** [Monad Builder's Cup](https://monad.xyz/builders-cup)

---

## 🤝 Contributing

This repository contains only the smart contracts for transparency and security auditing. The full platform (backend AI engine and frontend) is in a private repository.

**For security researchers:**
- Bug reports welcome via [GitHub Issues](https://github.com/MixasV/aicetro-contracts/issues)
- Responsible disclosure for critical vulnerabilities

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

**Note:** Smart contracts are open-source for transparency and trustless verification. The AI execution logic and backend infrastructure are proprietary.

---

## ⚠️ Disclaimer

**Testnet Deployment Only**

These contracts are currently deployed on Monad Testnet for hackathon demonstration purposes. 

**DO NOT USE WITH REAL FUNDS.**

A professional security audit is required before any mainnet deployment.

---

## 📞 Contact

- **Developer:** [@MixasV](https://github.com/MixasV)
- **Project:** Aicetro (DeFiTreasury AI)
- **Hackathon:** Monad Builder's Cup 2025

---

## 🙏 Acknowledgments

- **Monad Foundation** - For the Builder's Cup hackathon and testnet infrastructure
- **OpenRouter** - For AI provider aggregation
- **Envio** - For blockchain indexing capabilities
- **OpenZeppelin** - For battle-tested smart contract libraries

---

<p align="center">
  <strong>Built with ❤️ for trustless DeFi treasury management</strong>
</p>

<p align="center">
  <em>Securing institutional treasuries without compromising decentralization</em>
</p>
