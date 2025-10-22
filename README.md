# Aicetro DeFiTreasury AI

> AI-powered autonomous treasury management for DeFi portfolios on Monad Testnet

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Monad Testnet](https://img.shields.io/badge/Network-Monad%20Testnet-purple)](https://testnet.monadscan.io)
[![MetaMask](https://img.shields.io/badge/MetaMask-Delegation-orange)](https://docs.metamask.io/delegation-toolkit/)

**Built for:** [MetaMask Smart Accounts x Monad Dev Cook-Off Hackathon](https://www.hackquest.io/hackathons/MetaMask-Smart-Accounts-x-Monad-Dev-Cook-Off)

---

## 🎯 Overview

Aicetro DeFiTreasury is a **non-custodial AI portfolio manager** that optimizes DeFi yields using MetaMask's Delegation Framework. Users delegate limited permissions to an AI agent which executes trades on their behalf while they maintain full control over their funds.

### Key Features

- 🤖 **AI-Powered Optimization** - Multi-model AI (Claude, DeepSeek, GPT-4) analyzes 50+ DeFi protocols
- 🔐 **Non-Custodial** - User retains full ownership via MetaMask Smart Accounts
- ⚡ **Monad Testnet** - 10,000 TPS, sub-second finality
- 🏦 **Vault Architecture** - Secure fund management via smart contract vault
- 🛡️ **Safety Controls** - Daily limits, protocol whitelists, emergency pause
- 📊 **Real-Time Analytics** - Powered by Envio HyperIndex

---

## 🏗️ Architecture

```
User EOA (MetaMask)
  │
  │ 1. Create Hybrid Smart Account
  ↓
User Smart Account
  │
  │ 2. Sign Delegation (EIP-712)
  │ 3. Deposit to Vault
  ↓
DeFiTreasuryVault Contract
  │ Holds user funds securely
  │
  │ 4. AI Agent executes via delegation
  ↓
DeFi Protocols
(Uniswap V2, Aave, Nabla, Yearn)
```

### How It Works

1. **User connects MetaMask** and creates a Hybrid Smart Account
2. **User signs delegation** granting limited permissions to AI agent
3. **User deposits funds** into DeFiTreasuryVault smart contract
4. **AI analyzes markets** and generates optimal rebalancing strategies
5. **AI executes trades** via delegation (within daily limits)
6. **User monitors portfolio** in real-time via dashboard
7. **User can withdraw anytime** or revoke delegation instantly

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- MetaMask wallet
- Monad Testnet MON tokens

### Installation

```bash
# Clone repository
git clone https://github.com/MixasV/aicetro-defitreasuryai.git
cd aicetro-defitreasuryai

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Fill in required API keys:
# - ALCHEMY_API_KEY (for gas sponsorship)
# - OPENROUTER_API_KEY (for AI models)
# - MASTER_ENCRYPTION_PASSWORD (generate random)

# Start all services
docker-compose up -d

# Check status
docker-compose ps
curl http://localhost:4000/api/health
```

### Access

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **Envio GraphQL:** http://localhost:8081/v1/graphql

---

## 📦 Tech Stack

### Smart Contracts
- **Solidity 0.8.24** - DeFiTreasuryVault, Smart Account integration
- **MetaMask Delegation Toolkit** - Hybrid Smart Accounts (ERC-7710)
- **Hardhat** - Development & deployment

### Frontend
- **Next.js 14** - React framework with App Router
- **wagmi + viem** - Ethereum interactions
- **RainbowKit** - Wallet connection UI
- **TailwindCSS** - Styling

### Backend
- **Node.js + Express** - REST API server
- **Prisma ORM** - Database management
- **PostgreSQL 16** - Main database
- **Redis 7** - Caching layer

### Infrastructure
- **Monad Testnet** - High-performance blockchain (10,000 TPS)
- **Envio HyperIndex** - Real-time blockchain indexing
- **Alchemy** - Gas Manager & Bundler (ERC-4337)
- **OpenRouter** - Multi-model AI API

---

## 📝 Smart Contracts (Monad Testnet)

| Contract | Address | Description |
|----------|---------|-------------|
| **DeFiTreasuryVault** | [`0x00f78267767f788548AC5A78452E3cF4163Ae721`](https://testnet.monadscan.io/address/0x00f78267767f788548AC5A78452E3cF4163Ae721) | Main vault holding user deposits |
| **DelegationManager** | [`0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a`](https://testnet.monadscan.io/address/0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a) | MetaMask delegation manager |
| **Hybrid Delegator** | [`0x0fb901F876C65d4cc2491Cd2a0be8117E159dFee`](https://testnet.monadscan.io/address/0x0fb901F876C65d4cc2491Cd2a0be8117E159dFee) | Hybrid Smart Account impl |
| **EntryPoint** | [`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`](https://testnet.monadscan.io/address/0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789) | ERC-4337 EntryPoint |

---

## 🎮 Usage

### 1. Setup Wallet

Connect your MetaMask wallet to Monad Testnet:
- **Network:** Monad Testnet
- **Chain ID:** 10143
- **RPC:** https://testnet-rpc.monad.xyz
- **Explorer:** https://testnet.monadscan.io

Get test tokens from [Monad Discord faucet](https://discord.gg/monad).

### 2. Create Delegation

1. Navigate to `/setup/simple`
2. Select networks and tokens to manage
3. Set AI capital allocation (e.g., 15% of portfolio)
4. Configure risk limits and protocol whitelist
5. Sign delegation with MetaMask (EIP-712)

### 3. Deposit Funds

After creating delegation:
1. Deposit funds into DeFiTreasuryVault
2. Transaction calls `vault.deposit(amount, userSA)`
3. Funds are credited to your User Smart Account balance

### 4. Start AI Agent

1. Review delegation parameters
2. Start AI agent execution
3. Monitor dashboard for recommendations
4. AI rebalances portfolio within limits

### 5. Monitor & Control

- **Dashboard:** Real-time portfolio analytics
- **AI Controls:** Pause/resume AI anytime
- **Emergency Stop:** Instant halt all operations
- **Withdraw:** Pull funds anytime (no AI approval needed)

---

## 🛡️ Security

### Non-Custodial Design

- ✅ **User owns Smart Account** - Full control at all times
- ✅ **Delegation is revocable** - Cancel anytime via MetaMask
- ✅ **On-chain limits enforced** - Daily spending caps, protocol whitelist
- ✅ **Emergency controls** - Global pause mechanism
- ✅ **Encrypted keys** - AI agent keys encrypted with AES-256-CBC

### What AI Agent CAN'T Do

- ❌ Withdraw funds to external addresses
- ❌ Exceed daily spending limits
- ❌ Use non-whitelisted protocols
- ❌ Continue after delegation revoked
- ❌ Access your private keys

### Security Best Practices

1. **Start with small amounts** - Test with minimal funds first
2. **Set conservative limits** - Low daily limits, strict whitelists
3. **Monitor regularly** - Check dashboard for unexpected activity
4. **Use emergency stop** - If anything looks wrong, pause immediately
5. **Revoke delegation** - When done, revoke to prevent future executions

---

## 📊 Project Structure

```
aicetro-defitreasuryai/
├── apps/
│   ├── backend/              # Express API server
│   │   ├── src/
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── services/     # Business logic
│   │   │   └── utils/        # Helpers
│   │   └── prisma/           # Database schema
│   │
│   └── frontend/             # Next.js application
│       ├── src/
│       │   ├── app/          # Pages (App Router)
│       │   ├── components/   # React components
│       │   └── hooks/        # Custom hooks
│       └── public/           # Static assets
│
├── contracts/                # Smart contracts
│   ├── src/                  # Solidity files
│   └── scripts/              # Deployment scripts
│
├── envio-indexers/           # Envio HyperIndex
│   └── defitreasury/
│       ├── config.yaml       # Indexer config
│       └── schema.graphql    # GraphQL schema
│
├── docker-compose.yml        # Docker services
└── README.md                 # This file
```

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd apps/backend
pnpm test

# Smart contract tests
cd contracts
pnpm test
```

### Manual Testing

1. Start local environment: `docker-compose up -d`
2. Open frontend: http://localhost:3000
3. Follow setup wizard
4. Test delegation creation
5. Test vault deposit
6. Test AI execution

---

## 🤝 Contributing

Contributions are welcome! This is a hackathon project, so expect rough edges.

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- TypeScript for all code
- ESLint + Prettier for formatting
- Conventional commits
- Update tests for new features

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🏆 Hackathon Submission

**Hackathon:** MetaMask Smart Accounts x Monad Dev Cook-Off  
**Team:** Solo Developer + AI Assistant (Factory Droid)  
**Submission Date:** January 22, 2025

### Compliance Checklist

- ✅ Uses MetaMask Smart Accounts (Hybrid implementation)
- ✅ Deployed on Monad Testnet (Chain ID: 10143)
- ✅ Uses MetaMask Delegation Toolkit SDK
- ✅ Implements delegation as core feature (ERC-7710)
- ✅ Non-custodial architecture (user maintains control)

### Resources

- **Delegation Toolkit:** https://docs.metamask.io/delegation-toolkit/
- **Monad Docs:** https://docs.monad.xyz/
- **Envio Docs:** https://docs.envio.dev/
- **Alchemy:** https://docs.alchemy.com/

---

## 📞 Contact

**Developer:** [@MixasV](https://github.com/MixasV)  
**Project:** https://github.com/MixasV/aicetro-defitreasuryai  

**Issues & Questions:** [GitHub Issues](https://github.com/MixasV/aicetro-defitreasuryai/issues)

---

## 🙏 Acknowledgments

- **MetaMask** - Delegation Framework and Hybrid Smart Accounts
- **Monad** - High-performance blockchain testnet
- **FiYield** - Reference implementation inspiration
- **Envio** - Real-time blockchain indexing
- **Alchemy** - Gas sponsorship and bundler services
- **Factory Droid** - AI development assistant

---

**Built with ❤️ for the MetaMask x Monad Hackathon**
