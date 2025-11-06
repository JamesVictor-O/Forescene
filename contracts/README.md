# Forescene Smart Contracts

Professional, gas-optimized smart contracts for the Forescene prediction market on BNB Chain.

## 📁 Project Structure

```
contracts/
├── src/
│   ├── core/              # Main contracts
│   │   ├── PredictionRegistry.sol
│   │   ├── PredictionMarket.sol
│   │   ├── ResolutionOracle.sol
│   │   ├── ProphetPortfolio.sol
│   │   └── SocialMetrics.sol
│   ├── tokens/            # Token contracts
│   │   └── FORE.sol
│   └── interfaces/        # Contract interfaces
│       ├── IPredictionRegistry.sol
│       ├── IPredictionMarket.sol
│       └── IResolutionOracle.sol
├── script/                # Deployment scripts
│   └── Deploy.s.sol
├── test/                  # Tests
└── foundry.toml          # Foundry configuration
```

## 🏗️ Contract Architecture

### 1. **FORE Token** (`src/tokens/FORE.sol`)
- ERC20 token for staking and rewards
- Max supply: 1 billion tokens
- Burnable and mintable (owner only)

### 2. **PredictionRegistry** (`src/core/PredictionRegistry.sol`)
- Creates and manages predictions
- Handles prediction lifecycle (active → locked → resolved)
- Stores prediction metadata (CID, format, category, deadline)
- Admin functions for moderation

**Key Functions:**
- `createPrediction()` - Create new prediction
- `lockPrediction()` - Lock prediction (no more edits/stakes)
- `setPredictionActive()` - Moderation control

### 3. **PredictionMarket** (`src/core/PredictionMarket.sol`)
- Handles staking on predictions
- Uses CPMM (Constant Product Market Maker) for odds
- Manages liquidity pools
- Calculates and distributes payouts

**Key Functions:**
- `stakeFor()` / `stakeAgainst()` - Stake on predictions
- `quickStake()` - Quick stake with preset amounts
- `quoteOdds()` - Get odds for a stake
- `claimPayout()` - Claim winnings after resolution

### 4. **ResolutionOracle** (`src/core/ResolutionOracle.sol`)
- Proposes outcomes for predictions
- Handles disputes with bonding mechanism
- Finalizes outcomes after dispute window

**Key Functions:**
- `proposeOutcome()` - Oracle proposes outcome
- `disputeOutcome()` - Dispute with bond
- `finalizeOutcome()` - Finalize after dispute window

### 5. **ProphetPortfolio** (`src/core/ProphetPortfolio.sol`)
- NFT representing user's prediction portfolio
- Tracks reputation and prediction history
- Dynamic metadata based on performance

**Key Functions:**
- `mintPortfolio()` - Mint portfolio NFT
- `recordResult()` - Record prediction outcome
- `getScore()` - Get prophet score

### 6. **SocialMetrics** (`src/core/SocialMetrics.sol`)
- Lightweight social features
- Evidence submission
- Prediction flagging
- Creator tipping

## 🚀 Deployment

### Prerequisites
- Foundry installed
- BNB Chain RPC endpoint
- Private key with BNB for gas

### Deploy to BNB Testnet

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export BSCSCAN_API_KEY=your_bscscan_api_key

# Deploy
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545 \
  --broadcast \
  --verify
```

### Deploy to BNB Mainnet

```bash
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://bsc-dataseed1.binance.org \
  --broadcast \
  --verify \
  --slow
```

## 🧪 Testing

```bash
# Run all tests
forge test

# Run with gas reporting
forge test --gas-report

# Run specific test
forge test --match-path test/PredictionMarket.t.sol
```

## 📊 Gas Optimizations

- **Packed structs** - Minimize storage slots
- **Custom errors** - Cheaper than require strings
- **Events for indexing** - Off-chain data retrieval
- **Minimal storage reads** - Cache values in memory
- **Reentrancy guards** - Security without gas overhead
- **Efficient math** - Use basis points (10000) for fees

## 🔒 Security Features

- OpenZeppelin contracts for battle-tested security
- Reentrancy guards on all external functions
- Access control (Ownable, role-based)
- Input validation
- Safe math (Solidity 0.8.24 built-in)
- SafeERC20 for token transfers

## 📝 Key Events

All contracts emit events for off-chain indexing:

- `PredictionCreated` - New prediction created
- `PredictionLocked` - Prediction locked
- `StakePlaced` - User staked on prediction
- `OutcomeProposed` - Oracle proposed outcome
- `OutcomeFinalized` - Outcome finalized
- `PayoutClaimed` - User claimed payout
- `ReputationUpdated` - Portfolio updated
- `PortfolioMinted` - New portfolio NFT minted

## 🔧 Configuration

### PredictionRegistry
- `defaultFeeBps`: Default platform fee (250 = 2.5%)
- `minLockTime`: Minimum time before deadline to lock (1 hour)

### PredictionMarket
- `presetAmounts`: Quick stake amounts [10, 25, 50, 100] FORE

### ResolutionOracle
- `disputeWindow`: Time window for disputes (7 days)
- `disputeBond`: Bond required to dispute (1000 FORE)

### ProphetPortfolio
- `baseTokenURI`: Base URI for NFT metadata

## 📚 Integration Guide

### Frontend Integration

1. **Connect to contracts:**
```typescript
import { ethers } from 'ethers';

const FORE = new ethers.Contract(FORE_ADDRESS, FORE_ABI, provider);
const Registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
const Market = new ethers.Contract(MARKET_ADDRESS, MARKET_ABI, provider);
```

2. **Create prediction:**
```typescript
const tx = await Registry.createPrediction(
  contentCID,      // IPFS CID
  format,          // 0 = VIDEO, 1 = TEXT
  category,        // "crypto", "sports", etc.
  deadline,        // Unix timestamp
  creatorFeeBps    // 0-10000
);
```

3. **Stake on prediction:**
```typescript
// Approve first
await FORE.approve(MARKET_ADDRESS, amount);

// Stake FOR
await Market.stakeFor(predictionId, amount);

// Or stake AGAINST
await Market.stakeAgainst(predictionId, amount);
```

4. **Get odds:**
```typescript
const odds = await Market.quoteOdds(predictionId, side, amount);
```

5. **Claim payout:**
```typescript
await Market.claimPayout(predictionId);
```

## 🛠️ Development

### Install Dependencies

```bash
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2
```

### Compile

```bash
forge build
```

### Format

```bash
forge fmt
```

### Lint

```bash
forge fmt --check
```

## 📄 License

MIT
