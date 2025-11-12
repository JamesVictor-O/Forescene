import { defineChain } from "viem";
import { bscTestnet } from "viem/chains";

// Get RPC from environment variable - throw error if not set
const rpcUrl = process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL;

if (!rpcUrl) {
  throw new Error(
    "NEXT_PUBLIC_BSC_TESTNET_RPC_URL is not set. Please add it to your .env.local file."
  );
}

export const foresceneBscTestnet = defineChain({
  ...bscTestnet,
  rpcUrls: {
    default: {
      http: [rpcUrl],
    },
    public: {
      http: [rpcUrl],
    },
  },
});
