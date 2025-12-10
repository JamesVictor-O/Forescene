# 🌍 Forescene: The Social Prediction Game

## 💡 Vision & Goal

**Forescene** is the next-generation Social Prediction Game, blending the proven accuracy of prediction markets with the high engagement of gamified competition. We turn passion for **African entertainment, music, and culture** into a skill-based, competitive game build on the bnb and BlockDag blockchain.

**The Goal:** To become the most trusted and engaging platform for forecasting the future of African culture, transforming cultural expertise into verifiable status and reward.

---

## ❌ The Problem Forescene Solves

Prediction markets are powerful, but their current form fails to reach mass audiences because they are:

* **Boring and Confusing:** They rely on complex financial language (options, derivatives) and complicated charts, feeling like a niche stock market.
* **Too Focused on Global Finance:** They ignore high-interest, everyday passions, specifically neglecting the rapidly growing, youth-driven **African entertainment and media (E&M) sector** (Nigeria's E&M market is projected to grow at a 7.2% CAGR through 2029).
* **Hard to Access:** They lack the mobile-first, simple interfaces required for broad adoption across African digital markets.

### ✅ Our Solution: Forescene

Forescene changes prediction markets by making them a **simple, social game**:

* **It's a Game, Not a Stock Market:** We replace financial stakes with **Knowledge Points (KP)**, **Leagues**, and **Duels** to make predicting outcomes competitive and fun.
* **Culture First:** We focus exclusively on the most engaging topics in African entertainment and local trends, making predictions relevant to your daily life.
* **Skill Rewarded:** The platform is engineered to reward **skill and timing**, not just bankroll size, fostering genuine expertise.

---

## 🏆 Key Features & Gamification Engine

### 1. The Knowledge Point (KP) System

The single, simple currency for all staking, rewards, and fees.

* **Gamified Staking:** All stakes and rewards are denominated in **Knowledge Points (KP)**.
* **Early Bird Bonus (Weighted Stakes):** Winnings are calculated based on **Weighted Stakes**. Users who make correct predictions **earlier** in the market cycle receive a higher weighted stake value, increasing their share of the final prize pool. This rewards true foresight and conviction.

### 2. The Prediction League & Tiers

The core driver of engagement and status, based on weekly performance.

* **Metric:** Ranking is determined by the **Forecasting Accuracy Score (FAS)**, a composite metric combining: **Accuracy (60%)**, **Weighted KP Gain (30%)**, and **Prediction Streaks (10%)**.
* **Tiers:** Users are ranked into competitive tiers (Bronze, Silver, Gold, Diamond).
* **The Cycle:** Ranks are recalculated weekly, driving high-frequency competition to achieve promotion and avoid relegation.

### 3. Duels and Social Play

* **Head-to-Head Challenges:** Users can publicly challenge friends or rivals on specific markets.
* **Profile Status:** User profiles prominently display their current League Tier, FAS, and Duel Win/Loss record.

### 4. Market Quality Control

* **AI Validation:** An integrated AI module (Google Gemini) screens all user-submitted market questions for ambiguity, resolvability, and clarity, ensuring only high-quality markets are launched.
* **Scout Rewards:** Users who submit high-quality, AI-validated market questions earn the **Scout Badge** and a royalty share of the initial liquidity fees.

---

## 🛠️ Technology Stack & Architecture

Forescene utilizes a **Hybrid Architecture**, combining the trust of smart contracts with the speed of a modern backend.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React / Next.js | Modern, responsive web application (desktop and mobile-first UI). |
| **Smart Contracts** | EVM-Compatible Solidity | Core logic for staking, settlement, the KP system, and weighted reward calculation. |
| **Data Engine (Off-Chain)** | NodeJS, PostgreSQL | Handles complex, real-time calculations: **FAS Ranking, League Tier assignments,** and maintaining the global Leaderboard. |
| **AI/Oracles** | Google Gemini (API) | Market validation, content categorization, and question improvement. |
| **Styling** | Dark Mode (Vibrant Accents) | Implements the established professional, high-contrast, gamified aesthetic. |

---

## 🧑‍💻 Get Started (For Developers)

### Prerequisites

* Node.js (LTS version)
* Yarn or npm
* EVM development environment (Hardhat/Foundry)
* A Google Gemini API key (for the AI Validation module)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd forescene
    ```

2.  **Install dependencies:**
    ```bash
    yarn install
    # or
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and configure the necessary keys:
    ```
    # API Configuration
    NEXT_PUBLIC_API_URL=[Your Backend URL]
    GEMINI_API_KEY=[Your Gemini API Key]

    # Smart Contract Deployment
    EVM_NETWORK_URL=[Your Preferred Network RPC]
    WALLET_PRIVATE_KEY=[Deployment Wallet Key]
    ```

### Running the Development Server

1.  **Start the frontend:**
    ```bash
    yarn dev
    # or
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

2.  **Smart Contract Deployment (Example):**
    ```bash
    npx hardhat compile
    npx hardhat run scripts/deploy.js --network [Your Network Name]
    ```

---

## 🤝 Contribution & License

We welcome contributions! Please fork the repository, create a feature branch, and submit a detailed Pull Request.

* **License:** Distributed under the MIT License. See `LICENSE` for more information.