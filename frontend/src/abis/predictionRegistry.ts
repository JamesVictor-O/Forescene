export const predictionRegistryAbi = [
  {
    inputs: [
      { internalType: "string", name: "contentCID", type: "string" },
      { internalType: "uint8", name: "format", type: "uint8" },
      { internalType: "string", name: "category", type: "string" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint16", name: "creatorFeeBps", type: "uint16" },
    ],
    name: "createPrediction",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export type PredictionRegistryFunction = "createPrediction";
