import { defineChain } from "viem";
import { bscTestnet } from "viem/chains";

// Get RPC from environment variable (should be set in .env.local)
// Use public RPCs as fallback only (no API keys exposed)
const rpcUrl =
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ||
  "https://data-seed-prebsc-1-s1.binance.org:8545";

// Fallback RPC endpoints for better reliability (public endpoints only)
const fallbackRpcUrls = [
  rpcUrl, // Primary: from env var or public Binance
  "https://data-seed-prebsc-1-s1.binance.org:8545", // Binance public fallback
  "https://data-seed-prebsc-2-s1.binance.org:8545", // Binance public fallback 2
  "https://bsc-testnet.publicnode.com", // PublicNode fallback
];

export const foresceneBscTestnet = defineChain({
  ...bscTestnet,
  rpcUrls: {
    default: {
      http: fallbackRpcUrls,
    },
    public: {
      http: fallbackRpcUrls,
    },
  },
});
