# Aicetro (DeFiTreasury AI)

> AI-powered autonomous treasury management for corporate DeFi portfolios

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Monad](https://img.shields.io/badge/Blockchain-Monad-purple)](https://docs.monad.xyz/)
[![MetaMask](https://img.shields.io/badge/SDK-MetaMask-orange)](https://metamask.io/)

## 🏆 Hackathon Submission

**Built for:** MetaMask x Monad Hackathon  
**Category:** Corporate DeFi Innovation  
**Stack:** MetaMask Smart Accounts + Delegation Toolkit + Monad + Envio HyperIndex + OpenRouter AI

---

## 🎯 Problem Statement

Corporate treasuries hold billions in idle cash earning ~0-2% APY. Meanwhile, DeFi protocols offer 5-15% yields with institutional-grade security. **But CFOs won't touch DeFi** because:

- ❌ Technical complexity (keys, wallets, protocols)
- ❌ Security concerns (smart contract risks, admin backdoors)
- ❌ Time-consuming (24/7 market monitoring required)
- ❌ Compliance requirements (manual audit trails)

**The Gap:** Traditional finance earns 0-2%, DeFi offers 8-15%, but adoption is <1% of corporate cash.

---

## 💡 Solution

**Aicetro** = Trustless AI Agent + Corporate Smart Accounts + Real-time Protocol Intelligence

We enable **CFOs to earn DeFi yields without touching crypto**, through:

1. **MetaMask Smart Accounts** - Corporate wallets with multi-sig, no private keys exposure
2. **Trustless Delegation** - AI agent with strict limits, instant revoke, zero admin backdoors
3. **AI Autopilot** - OpenRouter-powered strategy optimizer analyzing 50+ protocols
4. **Real-time Monitoring** - Envio HyperIndex tracking every transaction and risk metric
5. **Monad Performance** - 10,000 TPS enables micro-optimizations and instant responses

### Key Innovation: **100% Trustless + Hybrid AI Execution**

Unlike competitors with admin keys or upgrade contracts, Aicetro has:
- ✅ **Zero admin access** - only user can control funds
- ✅ **Instant revoke** - stop AI in <1 second
- ✅ **On-chain limits** - daily caps, protocol whitelist, expiry enforced by smart contracts
- ✅ **Open source** - fully auditable code
- 🆕 **Hybrid Mode** - allocate % of portfolio for full AI automation (optional)

**New:** Users can enable auto-execution and allocate 5-50% of their portfolio for AI to manage autonomously. See [HYBRID_AI_EXECUTION.md](./HYBRID_AI_EXECUTION.md) for details.

---

## 🚀 Live Demo

**Testnet Deployment:** Monad Testnet (Chain ID: 2814)

**Try it yourself:** See [TESTNET_GUIDE.md](./TESTNET_GUIDE.md) for step-by-step instructions

**Video Walkthrough:** [Coming Soon]

### Smart Contracts (Monad Testnet)

```
Network: Monad Testnet
Chain ID: 2814
RPC URL: https://testnet-rpc.monad.xyz

Smart Contracts:
  - TrustlessDeFiTreasury: 0x98691ae190682dddBde3cd4c493B2249D2086E5B
  - TreasuryManager: 0x98691ae190682dddBde3cd4c493B2249D2086E5B
  - EmergencyController: 0x4BE4FE572bAce94aaFF05e4a0c03ff79212C20e5

Block Explorer: https://testnet.monadscan.io
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CORPORATE USER                          │
│                    (CFO / Treasury)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │  MetaMask Wallet    │
          │  Smart Account      │
          │  (Multi-sig 2-of-3) │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────────────────────┐
          │  Delegation Toolkit                 │
          │  ✓ Daily Limit: $10K               │
          │  ✓ Whitelist: [Nabla, Uniswap]    │
          │  ✓ Valid Until: 30 days            │
          │  ✓ Revoke: Instant                 │
          └──────────┬──────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐   ┌──────▼──────┐   ┌────▼─────┐
│ Monad  │   │  AI Agent   │   │  Envio   │
│ Testnet│◄──┤  (OpenRouter│──►│ HyperIndex│
│        │   │   DeepSeek) │   │          │
└────────┘   └─────────────┘   └──────────┘
    │               │                 │
    │    Executes   │   Monitors      │
    ▼    Strategy   ▼   Real-time     ▼
┌─────────────────────────────────────────┐
│     DeFi Protocols on Monad             │
│  • Nabla Finance (Stablecoins)         │
│  • UniswapV2 (DEX)                     │
│  • More protocols coming...            │
└─────────────────────────────────────────┘
```

---

## 🎨 Features

### For CFOs (Users)
- **5-Minute Setup** - Connect wallet → Set limits → Start earning
- **Dual-Mode Interface**:
  - **Real Trading Mode** - Monad testnet with real execution
  - **Preview Mode** - Mainnet data simulation (50+ protocols)
- **Security Dashboard** - Trustless guarantees, emergency controls, real-time status
- **Expected Yield** - See projected earnings before committing funds

### For Developers (Tech Stack)
- **Frontend**: Next.js 14, React 18, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Blockchain**: Solidity ^0.8.24, Hardhat, MetaMask SDK
- **Indexer**: Envio HyperSync + PostgreSQL
- **AI**: OpenRouter API (DeepSeek-v3, Claude-3.5, GPT-4o)

---

## 📊 Market Opportunity

**Total Addressable Market:**
- Corporate cash holdings: **$5.8 trillion** (US alone)
- Current DeFi yield advantage: **6-8% vs traditional 0-2%**
- Potential annual value unlock: **$348 billion**

**Target Customers:**
1. **Mid-size companies** ($10M-100M cash)
2. **Crypto-native startups** (already hold stables)
3. **Family offices** (high-net-worth individuals)

**Revenue Model** (Post-MVP):
- Performance fee: 10% of profit
- Subscription tiers: $99-$2,999/month
- Projected Year 2: **$1.96M ARR** with 200 clients

---

## 🛠️ Technology Stack

### Hackathon Technologies (Required)

#### 1. **MetaMask Smart Accounts**
```typescript
// Corporate wallet with programmable permissions
const smartAccount = await createSmartAccount({
  owners: [cfo, cto, treasurer],
  threshold: 2,
  features: ['delegation', 'timelock']
});
```

#### 2. **MetaMask Delegation Toolkit**
```typescript
// Grant limited permissions to AI agent
const delegation = await grantDelegation({
  aiAgent: AI_AGENT_ADDRESS,
  dailyLimitUSD: 10000,
  protocolWhitelist: [NABLA_FINANCE, UNISWAP_V2],
  validUntil: Date.now() + 30 * 24 * 60 * 60 * 1000
});
```

#### 3. **Monad Network**
- **10,000 TPS** - Enables high-frequency rebalancing
- **400ms blocks** - Near-instant confirmations
- **EVM compatible** - Seamless Solidity deployment

#### 4. **Envio HyperIndex**
```typescript
// Real-time portfolio tracking
const portfolio = await envioClient.query({
  portfolioPositions: {
    owner: account,
    valueUSD: true,
    currentAPY: true
  }
});
```

#### 5. **OpenRouter AI**
```typescript
// AI decision engine
const recommendation = await openRouter.complete({
  model: 'deepseek/deepseek-chat',
  prompt: `Analyze portfolio and recommend optimal allocation...`
});
```

---

## 📦 Installation

**For developers:** See **[INSTALL.md](./INSTALL.md)** for detailed setup instructions.

**For end users:** See **[TESTNET_GUIDE.md](./TESTNET_GUIDE.md)** to connect MetaMask and use the app.

### Quick Start (Development)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/aicetro-defitreasuryai.git
cd aicetro-defitreasuryai

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Start PostgreSQL & Redis
docker-compose up -d postgres redis

# 5. Run migrations
cd apps/backend
pnpm prisma migrate deploy
cd ../..

# 6. Start all services
pnpm dev

# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# Envio Indexer: Running in background
```

---

## 🧪 Testing

```bash
# Run all tests (140 unit tests)
pnpm test

# Lint check
pnpm lint

# Build production
pnpm build
```

**Test Coverage:**
- ✅ 140 unit tests (100% passing)
- ✅ 0 lint errors
- ✅ 0 TypeScript errors
- ✅ Smart contract tests included

---

## 🔐 Security

### Trustless Guarantees

1. **No Admin Keys**
```solidity
// ❌ No ownable pattern
// ❌ No upgradeable proxies
// ❌ No pause/unpause by admin
// ✅ Only user controls their funds
```

2. **On-chain Enforcement**
```solidity
modifier onlyAuthorizedAgent(address user) {
    if (!config.isActive) revert DelegationInactive(user);
    if (block.timestamp > config.validUntil) revert DelegationExpired();
    if (config.spentToday + valueUsd > config.dailyLimitUSD) 
        revert DailyLimitExceeded();
    _;
}
```

3. **Instant Emergency Stop**
```solidity
function emergencyStop() external {
    // User can stop AI in 1 transaction
    config.isActive = false;
    emit DelegationPaused(msg.sender);
}
```

---

## 📈 Metrics & Results

### Demo Performance (Testnet)

**MockCorp Treasury:**
- Initial: $100,000 USDC idle (0% APY)
- After AI optimization: $100,000 across Nabla + Uniswap
- **Expected APY: 8.2%** ($8,200/year)
- **Risk Score: Low** (both protocols whitelisted, audited)

### Efficiency Gains
- **Setup Time:** 5 minutes (vs 5 days manual research)
- **Monitoring:** 24/7 automated (vs 0 hours CFO time)
- **Rebalancing:** <400ms (vs manual hours)
- **Emergency Response:** <1 second (vs minutes/hours)

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Current - Hackathon)
- MetaMask Smart Accounts integration
- Trustless delegation framework
- AI strategy engine (3-5 protocols)
- Envio real-time monitoring
- Monad testnet deployment

### 🚧 Phase 2: Beta (Post-Hackathon, 0-3 months)
- Mainnet deployment (Ethereum, Polygon)
- 20+ protocol integrations
- Professional security audit
- Beta customer onboarding (10 companies)

### 🔮 Phase 3: Production (3-12 months)
- Insurance partnerships (Nexus Mutual)
- Multi-chain expansion (Arbitrum, Optimism, Base)
- Enterprise features (ERP integration, compliance automation)
- 100+ protocols supported

### 🌟 Phase 4: Scale (12+ months)
- Institutional custody partnerships
- Regulatory compliance automation
- Cross-chain liquidity optimization
- 1,000+ corporate clients

---

## 👥 Team

**Solo Developer** (Hackathon MVP)

Future roles needed:
- Smart Contract Auditor
- Full-stack Engineer
- Blockchain DevOps
- Business Development

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

**Hackathon Sponsors:**
- MetaMask Team - Smart Accounts & Delegation Toolkit
- Monad Labs - High-performance blockchain
- Envio - Real-time indexing infrastructure
- OpenRouter - AI model access

**Open Source:**
- OpenZeppelin - Smart contract libraries
- Hardhat - Development environment
- Next.js - Frontend framework
- Prisma - Database ORM

---

## 📞 Contact

**Project:** Aicetro (DeFiTreasury AI)  
**GitHub:** [github.com/yourusername/aicetro](https://github.com/yourusername/aicetro)  
**Demo:** [Coming Soon]  
**Email:** [Your Email]

---

## 🎬 Demo Scenario

**Watch our 10-minute demo walkthrough:**

1. **Setup** (2 min) - CFO creates Smart Account, configures delegation
2. **AI Analysis** (3 min) - Real-time protocol comparison, risk scoring
3. **Execution** (2 min) - Automated strategy deployment on Monad
4. **Monitoring** (2 min) - Envio dashboard, performance tracking
5. **Emergency** (1 min) - Instant stop demonstration

**Key Takeaway:** CFOs can earn 8-15% DeFi yields without touching crypto, with 100% trustless guarantees.

---

<p align="center">
  <strong>Built with ❤️ for corporate treasurers everywhere</strong>
</p>
