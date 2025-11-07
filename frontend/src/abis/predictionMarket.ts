export const predictionMarketAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "predictionId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "stakeFor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "predictionId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "stakeAgainst",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "predictionId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "copyPrediction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;

export type PredictionMarketFunction =
  | "stakeFor"
  | "stakeAgainst"
  | "copyPrediction";
