# AIcetro Documentation

**Version:** 1.1.0-beta  
**Last Updated:** 2025-01-11  
**Status:** Beta on Monad Testnet

---

## 📚 Documentation Index

### For Users

| Document | Description | Target Audience |
|----------|-------------|-----------------|
| [Simple Mode Guide](./user/simple-mode-guide.md) | Complete walkthrough of Simple Mode setup | Individual users |
| [Simple vs Corporate](./user/simple-vs-corporate.md) | Detailed comparison of both modes | All users |
| [FAQ](./user/faq.md) | Frequently asked questions | All users |

### For Developers

| Document | Description | Target Audience |
|----------|-------------|-----------------|
| [README.md](../README.md) | Project overview & setup | Developers |
| [NEXT_STEPS_PLAN.md](../NEXT_STEPS_PLAN.md) | Implementation roadmap | Contributors |
| [SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md) | Security design | Auditors |
| [changelog.md](../changelog.md) | Version history | All |

---

## 🚀 Quick Start

### New Users

1. **Choose Your Mode:**
   - Read: [Simple vs Corporate Comparison](./user/simple-vs-corporate.md)
   - Decide: Simple (<$100k) or Corporate (≥$100k)

2. **Set Up:**
   - Simple Mode: [Setup Guide](./user/simple-mode-guide.md)
   - Corporate Mode: Visit `/wizard` with auto-detection

3. **Get Help:**
   - Common issues: [FAQ](./user/faq.md)
   - Support: support@aicetro.com

### Developers

1. **Setup Development Environment:**
   ```bash
   git clone https://github.com/yourusername/aicetro-defitreasuryai
   cd aicetro-defitreasuryai
   cp .env.example .env
   docker-compose up -d
   ```

2. **Read Architecture:**
   - [SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md)
   - [ERC-4337 Implementation](../AI+erc4337.md)
   - [Smart Contracts](../contracts/README.md)

3. **Contribute:**
   - [NEXT_STEPS_PLAN.md](../NEXT_STEPS_PLAN.md)
   - Submit PRs to GitHub

---

## 📖 Documentation Structure

```
docs/
├── README.md                     ← You are here
├── user/                         ← End-user documentation
│   ├── simple-mode-guide.md      │ Simple Mode walkthrough
│   ├── simple-vs-corporate.md    │ Mode comparison
│   └── faq.md                    │ FAQ
│
├── developer/ (coming soon)      ← Developer documentation
│   ├── architecture.md           │ System architecture
│   ├── api-reference.md          │ API endpoints
│   ├── smart-contracts.md        │ Contract documentation
│   └── testing-guide.md          │ Testing procedures
│
└── operations/ (coming soon)     ← Operations documentation
    ├── deployment-guide.md       │ Deployment steps
    ├── monitoring-guide.md       │ Monitoring setup
    └── troubleshooting.md        │ Common issues
```

---

## 🎯 Documentation by Role

### I'm a User
**Goal:** Use AIcetro to manage my portfolio

**Start Here:**
1. [FAQ](./user/faq.md#what-is-aicetro) - Understand what AIcetro is
2. [Simple vs Corporate](./user/simple-vs-corporate.md) - Choose your mode
3. [Simple Mode Guide](./user/simple-mode-guide.md) - Set up (if <$100k)

**Common Tasks:**
- "How do I set up?" → [Simple Mode Guide](./user/simple-mode-guide.md#setup-process)
- "What's the difference?" → [Comparison](./user/simple-vs-corporate.md#feature-comparison-matrix)
- "Is it safe?" → [FAQ: Security](./user/faq.md#security)
- "How much does it cost?" → [FAQ: Pricing](./user/faq.md#pricing--fees)

---

### I'm a Developer
**Goal:** Understand & contribute to AIcetro

**Start Here:**
1. [README.md](../README.md) - Project overview
2. [SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md) - Security design
3. [changelog.md](../changelog.md) - Recent changes

**Common Tasks:**
- "How does it work?" → [SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md)
- "What's the architecture?" → [AI+erc4337.md](../AI+erc4337.md)
- "How do I contribute?" → [NEXT_STEPS_PLAN.md](../NEXT_STEPS_PLAN.md)
- "What's changed?" → [changelog.md](../changelog.md)

---

### I'm an Auditor
**Goal:** Verify security & correctness

**Start Here:**
1. [SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md) - Security model
2. [Smart Contracts](../contracts/src/) - Contract code
3. [Backend Services](../apps/backend/src/services/) - Business logic

**Focus Areas:**
- **Non-Custodial Verification:** No private keys stored
- **Access Control:** Role-based permissions
- **ERC-4337 Delegation:** UserOperation validation
- **Rate Limiting:** Daily/monthly caps enforced
- **Protocol Whitelisting:** Only approved protocols

**Security Contact:** security@aicetro.com

---

## 🔍 Find Documentation

### By Topic

**Simple Mode:**
- Setup: [Simple Mode Guide § Setup](./user/simple-mode-guide.md#setup-process)
- Security: [Simple Mode Guide § Security](./user/simple-mode-guide.md#security-architecture)
- Costs: [Comparison § Costs](./user/simple-vs-corporate.md#cost-comparison)

**Corporate Mode:**
- When to use: [Comparison § Decision Guide](./user/simple-vs-corporate.md#quick-decision-guide)
- Multi-Sig: [FAQ § Multi-Sig](./user/faq.md#how-does-multi-signature-work)
- Migration: [Comparison § Migration](./user/simple-vs-corporate.md#migration-path)

**Security:**
- Non-Custodial: [FAQ § Safety](./user/faq.md#is-my-money-safe)
- ERC-4337: [FAQ § ERC-4337](./user/faq.md#whats-erc-4337)
- Architecture: [SECURITY_ARCHITECTURE.md](../SECURITY_ARCHITECTURE.md)

**Technical:**
- API: [Backend Routes](../apps/backend/src/routes/)
- Smart Contracts: [Contracts](../contracts/src/)
- Multi-Chain: [changelog.md § Alchemy](../changelog.md#alchemy-portfolio-api-integration-2025-01-11)

---

## 🆕 Recent Updates

### January 11, 2025 - v1.1.0-beta

**New Features:**
- ✅ Multi-chain balance checking (Alchemy Portfolio API)
- ✅ Hybrid Mode with auto capital detection
- ✅ Scans 6 networks: ETH, Polygon, Arbitrum, Optimism, Base, Matic
- ✅ Real-time USD pricing via Alchemy Prices API

**Documentation:**
- ✅ Simple Mode User Guide
- ✅ Simple vs Corporate Comparison
- ✅ Comprehensive FAQ

See [changelog.md](../changelog.md) for full history.

---

## ❓ Can't Find What You Need?

### Documentation Missing?

**For Users:**
- Ask in [Discord](https://discord.gg/aicetro)
- Email: support@aicetro.com

**For Developers:**
- Open issue: [GitHub Issues](https://github.com/aicetro/issues)
- Email: dev@aicetro.com

**For Security:**
- Responsible disclosure: security@aicetro.com
- PGP key: [security.aicetro.com/pgp](https://security.aicetro.com)

---

## 🤝 Contributing to Docs

Found a typo? Want to improve documentation?

**How to Contribute:**
1. Fork repository
2. Edit markdown files
3. Submit pull request
4. Wait for review

**Style Guide:**
- Use clear, simple language
- Add examples for complex topics
- Include code snippets where helpful
- Update "Last Updated" date

---

## 📞 Support Channels

**Community:**
- Discord: [discord.gg/aicetro](https://discord.gg)
- Telegram: [@aicetro](https://t.me/aicetro)
- Twitter: [@aicetro_ai](https://twitter.com)
- Forum: [forum.aicetro.com](https://forum.aicetro.com)

**Direct:**
- General: support@aicetro.com
- Technical: dev@aicetro.com
- Security: security@aicetro.com
- Partnerships: partnerships@aicetro.com

**Business Hours:**
- Monday-Friday: 9am-6pm UTC
- Response time: <24 hours
- Emergency: 24/7 (security issues)

---

## 📄 License

Documentation is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Code is licensed under [MIT License](../LICENSE).

---

**Last Updated:** 2025-01-11  
**Version:** 1.1.0-beta  
**Maintained by:** AIcetro Team
