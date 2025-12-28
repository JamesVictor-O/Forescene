import { foreAbi } from "@/abis/fore";
import { predictionMarketAbi } from "@/abis/predictionMarket";
import { predictionRegistryAbi } from "@/abis/predictionRegistry";
import { prophetPortfolioAbi } from "@/abis/prophetPortfolio";
import { resolutionOracleAbi } from "@/abis/resolutionOracle";
import { socialMetricsAbi } from "@/abis/socialMetrics";
import { knowledgePointTokenAbi } from "@/abis/knowledgePointToken";
import { predictionManagerAbi } from "@/abis/predictionManager";

type ContractDefinition<Abi extends readonly unknown[]> = {
  address: `0x${string}`;
  abi: Abi;
};

type ContractEntries = {
  foreToken: ContractDefinition<typeof foreAbi>;
  predictionRegistry: ContractDefinition<typeof predictionRegistryAbi>;
  predictionMarket: ContractDefinition<typeof predictionMarketAbi>;
  resolutionOracle: ContractDefinition<typeof resolutionOracleAbi>;
  prophetPortfolio: ContractDefinition<typeof prophetPortfolioAbi>;
  socialMetrics: ContractDefinition<typeof socialMetricsAbi>;
  kpToken: ContractDefinition<typeof knowledgePointTokenAbi>;
  predictionManager: ContractDefinition<typeof predictionManagerAbi>;
};

type NetworkConfig = {
  chainId: number;
  name: string;
} & ContractEntries;

export const CONTRACTS = {
  bscTestnet: {
    chainId: 97,
    name: "BNB Smart Chain Testnet",
    foreToken: {
      address: "0x5DE0b93d59D4AFd803649f5D333030b33CfddFC6",
      abi: foreAbi,
    },
    predictionRegistry: {
      address: "0xC46b51268B9BD8a8190B2106354415B58CF34787",
      abi: predictionRegistryAbi,
    },
    predictionMarket: {
      address: "0x0E4830E472F90B7C2Fa271206A07B5Cc36f940bF",
      abi: predictionMarketAbi,
    },
    resolutionOracle: {
      address: "0x5ca009564018ac4eb6D2B41FC455f9a505118df5",
      abi: resolutionOracleAbi,
    },
    prophetPortfolio: {
      address: "0x7C4F78B708c94B38f5f8592702033abF43688098",
      abi: prophetPortfolioAbi,
    },
    socialMetrics: {
      address: "0x51535762f7Fd1886ADaF6f82e5BacAEcf2D22f34",
      abi: socialMetricsAbi,
    },
    kpToken: {
      address: "0x0000000000000000000000000000000000000000",
      abi: knowledgePointTokenAbi,
    },
    predictionManager: {
      address: "0x0000000000000000000000000000000000000000",
      abi: predictionManagerAbi,
    },
  },
  blockdagTestnet: {
    chainId: 1043,
    name: "BlockDag Testnet",
    foreToken: {
      address: "0x0000000000000000000000000000000000000000",
      abi: foreAbi,
    },
    predictionRegistry: {
      address: "0x0000000000000000000000000000000000000000",
      abi: predictionRegistryAbi,
    },
    predictionMarket: {
      address: "0x0000000000000000000000000000000000000000",
      abi: predictionMarketAbi,
    },
    resolutionOracle: {
      address: "0x0000000000000000000000000000000000000000",
      abi: resolutionOracleAbi,
    },
    prophetPortfolio: {
      address: "0x0000000000000000000000000000000000000000",
      abi: prophetPortfolioAbi,
    },
    socialMetrics: {
      address: "0x0000000000000000000000000000000000000000",
      abi: socialMetricsAbi,
    },
    kpToken: {
      address: "0x767CA5407f82A188e873aA164D1947947b2aBb8F",
      abi: knowledgePointTokenAbi,
    },
    predictionManager: {
      address: "0xdC233dc086d0c88bCCF7f7CD57789522EE1D2104",
      abi: predictionManagerAbi,
    },
  },
} satisfies Record<string, NetworkConfig>;

export type SupportedNetwork = keyof typeof CONTRACTS;

type ContractKey = keyof ContractEntries;

export const ACTIVE_NETWORK: SupportedNetwork = "blockdagTestnet";

export const getNetworkConfig = (network: SupportedNetwork = ACTIVE_NETWORK) =>
  CONTRACTS[network];

export const getContract = <K extends ContractKey>(
  contract: K,
  network: SupportedNetwork = ACTIVE_NETWORK
) => CONTRACTS[network][contract];
