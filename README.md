# 🎥 Forescene

**"Predict the Future. Prove You Were Right."**

Forescene is a **social prediction platform** where users create **short-form video/text predictions** about real-world events from sports and crypto to pop culture and politics — and **earn rewards for accuracy and influence**.

Think Of It As **TikTok meets Polymarket**, where your predictions build your reputation, your audience, and your on-chain portfolio.

---

## 🌍 Vision

The world is full of opinions — but there’s no proof of who was _actually right_ when things play out.

**Forescene** turns _predictions_ into _digital assets_ — making it fun, social, and rewarding to call the future correctly.

We’re building a future where:

- Insight is rewarded.
- Reputation is quantifiable.
- Predictions become a form of expression, not just speculation.
- People Put there money where there mouth is.

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

**Forescene** transforms predictions into short-form fun, engaging, verifiable content.

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
   - Every correct prediction adds to your _on-chain portfolio_.
   - Your history becomes a tradeable **Prophet Portfolio NFT**.

---

### 💰 For Investors (Backers)

1. **Discover Predictions**

   - Scroll a TikTok-style feed of short videos/text.
   - Filter by categories: Sports, Crypto, Entertainment, Politics, etc.

2. **Back Predictions or Predictors**

   - Bet on specific predictions you believe in or against.
   - Or back entire predictor portfolios (trust the talent).

3. **Trade Positions**

   - Buy/sell your stakes as odds shift in real time.
   - Early believers profit most.

4. **Earn Returns**
   - Correct predictions yield payouts and influence boosts.

---

## ⚙️ Core System Architecture

| Layer              | Tech                                  | Description                                                         |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------- |
| **Frontend (App)** | Next.js (React, TypeScript, Tailwind) | Social video interface, wallet connection, and feed system.         |
| **Contracts**      | Foundry (Solidity)                    | Smart contracts for staking, rewards, and portfolio NFTs.           |
| **AI Layer**       | Whisper + GPT APIs                    | Extracts structured claims from video predictions for verification. |
| **Oracles**        | Chainlink + Custom APIs               | Verifies event outcomes (sports, crypto, entertainment).            |
| **Backend / DB**   | Node.js + Postgres                    | Manages user data, metadata, and event outcomes.                    |
| **Blockchain**     | Base or Ethereum Layer 2              | Handles token logic and proof-of-accuracy records.                  |

---

## 🧩 Unique Features

| Feature                          | Description                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| 🎥 **Video Predictions**         | Engage users with short-form video, not boring charts.                                 |
| 🔮 **Prophet Portfolios (NFTs)** | Your prediction history as a verified, tradeable digital identity.                     |
| ⚔️ **Prediction Battles**        | Two predictors make opposing calls; community decides who wins.                        |
| 🎭 **Duet Predictions**          | Respond to others with counter-predictions — social, viral, competitive.               |
| 👥 **Squad Mode**                | Form teams, pool knowledge, and share winnings.                                        |
| 🧠 **Category Experts**          | Earn badges as verified authorities in niches (e.g., “Crypto Prophet,” “Sports Guru”). |
| 💬 **Insider Bounties**          | Users post challenges: “Which team signs Mbappé? Winner gets 500 tokens.”              |

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

| Phase       | Focus                     | Deliverable                              |
| ----------- | ------------------------- | ---------------------------------------- |
| **Month 1** | MVP foundation            | Next.js UI, wallet connect, video upload |
| **Month 2** | Prediction logic          | AI parsing + backend claim verification  |
| **Month 3** | Smart contracts + Rewards | Foundry contracts + on-chain reputation  |

---

## 💬 Why It Matters

Forescene blurs the line between _social media_ and _financial markets_ — making **truth, insight, and influence** a new form of digital currency.

In a world full of noise, **Forescene** rewards clarity, foresight, and accuracy.

---

## Architecture Diagram

```mermaid
%% Forescene architecture (Mermaid)
flowchart LR
  subgraph USER_LAYER["User / Social Layer"]
    U1[Mobile App (Next.js / React)] -->|record video| V[Video Upload (IPFS CID)]
    U1 -->|wallet actions| Wallet[Wallet (Metamask / WalletConnect)]
    U1 -->|interact| Feed[Social Feed / Duets / Copy]
  end

  subgraph AI_LAYER["AI & Parsing"]
    V --> STT[Speech-to-Text (Whisper)]
    STT --> NLP[LLM Parser (extract: event, condition, deadline)]
    NLP -->|structured claim| BackendAPI[Backend API]
    NLP -->|flag/verifiability| VerifFilter[Verifiability Filter]
  end

  subgraph BACKEND_DB["Backend & Data Layer"]
    BackendAPI --> DB[Postgres / Prisma (claims, users, social)]
    BackendAPI --> SharedABI[Shared / exported ABIs & metadata]
    BackendAPI --> EventQueue[Event Queue / Worker (resolve jobs)]
    DB -->|feeds feed UI| Feed
  end

  subgraph ONCHAIN["Smart Contracts (Foundry)"]
    style ONCHAIN stroke:#333,stroke-width:2px
    PredictionRegistry[core/PredictionRegistry.sol]
    PredictionMarket[core/PredictionMarket.sol]
    ResolutionOracle[core/ResolutionOracle.sol]
    ProphetPortfolio[core/ProphetPortfolio.sol (ERC721)]
    SocialMetrics[core/SocialMetrics.sol]
    FSPausable[core/FSPausable.sol]
    FeeRouter[core/FeeRouter.sol]
    TemplateRegistry[core/TemplateRegistry.sol]
    Treasury[core/Treasury.sol]
    InsurancePool[core/InsurancePool.sol]
    PriceFeedRouter[core/PriceFeedRouter.sol]
    CreatorStaking[core/CreatorStaking.sol]
    Squad[core/Squad.sol]
    PredictionPosition[core/PredictionPosition.sol (ERC1155)]
    FraudDetection[core/FraudDetection.sol]
    CrossChainBridge[core/CrossChainBridge.sol]
    Governance[governance/CreatorDAO.sol]
  end

  %% Connections between backend and contracts
  BackendAPI -->|create & sign tx| PredictionRegistry
  Wallet -->|tx: create / stake / trade| PredictionMarket
  PredictionMarket --> FeeRouter
  FeeRouter --> Treasury
  PredictionRegistry --> TemplateRegistry
  ResolutionOracle -->|resolve call| PredictionMarket
  ResolutionOracle -->|finalize| PredictionRegistry
  PredictionMarket -->|mint position NFT| PredictionPosition
  PredictionRegistry --> ProphetPortfolio
  ProphetPortfolio --> SharedABI
  SocialMetrics --> DB
  CreatorStaking --> ProphetPortfolio
  Squad --> Treasury
  InsurancePool --> Treasury
  PriceFeedRouter --> ResolutionOracle
  PriceFeedRouter -->|price feeds| Chainlink[Chainlink / Pyth / Custom APIs]
  Chainlink --> ResolutionOracle

  %% Oracles and external data
  subgraph ORACLES["External Oracles & Data"]
    Chainlink
    SportsAPI[Sports APIs]
    BoxOffice[BoxOffice / Streaming APIs]
    Government[Official Results / Government Data]
  end

  Chainlink --> PriceFeedRouter
  SportsAPI --> PriceFeedRouter
  BoxOffice --> PriceFeedRouter
  Government --> PriceFeedRouter

  %% Event resolution flow
  EventQueue --> ResolutionOracle
  ResolutionOracle -->|dispute window| Dispute[Dispute Module / Bonding]
  Dispute --> InsurancePool
  Dispute --> Governance

  %% Social / UX loops
  PredictionMarket -->|events/emits| BackendAPI
  BackendAPI -->|update user stats| DB
  DB --> Feed

  %% Admin / Governance
  Governance --> TemplateRegistry
  Governance --> FeeRouter
  Governance --> Treasury
  Governance --> ResolutionOracle
```

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

```

## 🚀 Deploying to BNB Testnet

### 1. Configure environment variables

Create a `contracts/.env` file (do **not** commit this) with:

```bash
PRIVATE_KEY=0xYourDeployerPrivateKey
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
BSCSCAN_API_KEY=your_bscscan_api_key
```

For the frontend, create `frontend/.env.local` after deployment and supply the contract addresses:

```bash
NEXT_PUBLIC_CHAIN_ID=97
NEXT_PUBLIC_PREDICTION_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x...
NEXT_PUBLIC_RESOLUTION_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_SOCIAL_METRICS_ADDRESS=0x...
NEXT_PUBLIC_PROPHET_PORTFOLIO_ADDRESS=0x...
```

### 2. Deploy the contracts

Fund the deployer wallet with testnet BNB, then run:

```bash
cd contracts
source .env

forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$BSC_TESTNET_RPC_URL" \
  --chain 97 \
  --broadcast \
  --verify \
  -vvvv
```

The script prints the deployed addresses for the token, registry, market, oracle, portfolio, and social metrics contracts.

### 3. (Optional) Contract verification

Use Foundry’s verify command with the address from step 2:

```bash
forge verify-contract \
  --chain 97 \
  --num-of-optimizations 200 \
  --watch \
  <DEPLOYED_CONTRACT_ADDRESS> \
  src/core/PredictionRegistry.sol:PredictionRegistry
```

Repeat for other contracts as needed.

### 4. Configure the frontend and deploy

Set the `NEXT_PUBLIC_*` values in `frontend/.env.local`, then rebuild:

```bash
cd ../frontend
npm install
npm run build
```

When deploying to Vercel, use `frontend` as the root directory and copy the same environment variables into the project settings.
