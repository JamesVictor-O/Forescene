# 🎥 Forescene

**"Predict the Future. Prove You Were Right."**

Forescene is a **mobile-first social prediction platform** where users create **short-form video predictions** about real-world events — from sports and crypto to pop culture and politics — and **earn rewards for accuracy and influence**.

Think **TikTok meets Polymarket**, where your predictions build your reputation, your audience, and your on-chain portfolio.

---

## 🌍 Vision

The world is full of opinions — but there’s no proof of who was *actually right* when things play out.

**Forescene** turns *predictions* into *digital assets* — making it fun, social, and rewarding to call the future correctly.

We’re building a future where:
- Insight is rewarded.
- Reputation is quantifiable.
- Predictions become a form of expression, not just speculation.

---

## 🎯 The Problem

Prediction markets today are:
- ❌ Text-heavy, complex, and boring.  
- ❌ Desktop-focused, not mobile-first.  
- ❌ Financially driven, not socially engaging.  
- ❌ Lacking creator incentives or reputation systems.

Meanwhile, millions of people on TikTok, X, and YouTube make bold predictions daily — but those insights are **lost in the feed**.  
No one tracks accuracy. No one gets rewarded.

---

## 💡 The Forescene Solution

**Forescene** transforms predictions into short-form, verifiable content.

Creators post **15–60 second prediction videos**, staking confidence points (or tokens) to prove belief.  
When outcomes are verified, accurate predictors earn rewards and reputation — creating an economy of truth and foresight.

---

## 🎮 How It Works

### 👤 For Predictors (Creators)
1. **Record a Prediction Video**
   - Example: “BTC will hit $100K before December 31.”
   - Add tags like `#crypto` or `#sports`.
   - AI automatically extracts and structures your claim.

2. **Stake Your Confidence**
   - Lock in reputation points or tokens (optional in MVP).
   - Higher stake = higher potential credibility and rewards.

3. **Earn Multiple Ways**
   - 🎯 **Accuracy Rewards** – Earn when your prediction is right.  
   - 📈 **Influence Fees** – Earn when others back your predictions.  
   - 🌟 **Reputation Growth** – Build your verified “Prophet Score.”  
   - 🤝 **Sponsorships** – Top predictors attract brand deals.

4. **Own Your Track Record**
   - Every correct prediction adds to your *on-chain portfolio*.  
   - Your history becomes a tradeable **Prophet Portfolio NFT**.

---

### 💰 For Investors (Backers)
1. **Discover Predictions**
   - Scroll a TikTok-style feed of short videos.  
   - Filter by categories: Sports, Crypto, Entertainment, Politics, etc.

2. **Back Predictions or Predictors**
   - Bet on specific predictions you believe in.
   - Or back entire predictor portfolios (trust the talent).

3. **Trade Positions**
   - Buy/sell your stakes as odds shift in real time.  
   - Early believers profit most.

4. **Earn Returns**
   - Correct predictions yield payouts and influence boosts.

---

## ⚙️ Core System Architecture

| Layer | Tech | Description |
|-------|------|--------------|
| **Frontend (App)** | Next.js (React, TypeScript, Tailwind) | Social video interface, wallet connection, and feed system. |
| **Contracts** | Foundry (Solidity) | Smart contracts for staking, rewards, and portfolio NFTs. |
| **AI Layer** | Whisper + GPT APIs | Extracts structured claims from video predictions for verification. |
| **Oracles** | Chainlink + Custom APIs | Verifies event outcomes (sports, crypto, entertainment). |
| **Backend / DB** | Node.js + Postgres | Manages user data, metadata, and event outcomes. |
| **Blockchain** | Base or Ethereum Layer 2 | Handles token logic and proof-of-accuracy records. |

---

## 🧩 Unique Features

| Feature | Description |
|----------|-------------|
| 🎥 **Video Predictions** | Engage users with short-form video, not boring charts. |
| 🔮 **Prophet Portfolios (NFTs)** | Your prediction history as a verified, tradeable digital identity. |
| ⚔️ **Prediction Battles** | Two predictors make opposing calls; community decides who wins. |
| 🎭 **Duet Predictions** | Respond to others with counter-predictions — social, viral, competitive. |
| 👥 **Squad Mode** | Form teams, pool knowledge, and share winnings. |
| 🧠 **Category Experts** | Earn badges as verified authorities in niches (e.g., “Crypto Prophet,” “Sports Guru”). |
| 💬 **Insider Bounties** | Users post challenges: “Which team signs Mbappé? Winner gets 500 tokens.” |

---

## 🧠 Technical Flow (Simplified)

🎬 User uploads video
↓
🗣 Speech-to-text (Whisper)
↓
🤖 AI parses structured claim (event + condition + deadline)
↓
🧾 Claim stored on-chain (optional)
↓
📡 Oracle verifies outcome at deadline
↓
🏆 Rewards & reputation updated automatically,


---

## 🧩 Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS  
- **Contracts:** Foundry, Solidity, Forge Std  
- **AI Services:** OpenAI Whisper, GPT-4o-mini  
- **Oracles:** Chainlink, Custom API feeds  
- **Database:** PostgreSQL + Prisma  
- **Deployment:** Vercel (Frontend), Base Testnet (Contracts)

---

## 🚀 MVP Roadmap (Next 3 Months)

| Phase | Focus | Deliverable |
|-------|--------|-------------|
| **Month 1** | MVP foundation | Next.js UI, wallet connect, video upload |
| **Month 2** | Prediction logic | AI parsing + backend claim verification |
| **Month 3** | Smart contracts + Rewards | Foundry contracts + on-chain reputation |

---

## 💬 Why It Matters

Forescene blurs the line between *social media* and *financial markets* — making **truth, insight, and influence** a new form of digital currency.

In a world full of noise, **Forescene** rewards clarity, foresight, and accuracy.

---

## 🧑‍💻 Development Setup

### Prerequisites
- Node.js v18+
- pnpm or npm
- Foundry (`curl -L https://foundry.paradigm.xyz | bash`)

### Setup Steps
```bash
# Clone the repo
git clone https://github.com/<your-username>/forescene.git
cd forescene

# Install frontend
cd frontend
pnpm install
pnpm dev

# Install contracts
cd ../contracts
forge build
