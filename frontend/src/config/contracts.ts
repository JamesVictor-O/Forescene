import { foreAbi } from "@/abis/fore";
import { predictionMarketAbi } from "@/abis/predictionMarket";
import { predictionRegistryAbi } from "@/abis/predictionRegistry";
import { prophetPortfolioAbi } from "@/abis/prophetPortfolio";
import { resolutionOracleAbi } from "@/abis/resolutionOracle";
import { socialMetricsAbi } from "@/abis/socialMetrics";

const DEFAULT_BSC_TESTNET_RPC_URL =
  process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL ??
  "https://bsc-testnet-rpc.publicnode.com";

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
};

type NetworkConfig = {
  chainId: number;
  name: string;
  rpcUrl: string;
} & ContractEntries;

export const CONTRACTS = {
  bscTestnet: {
    chainId: 97,
    name: "BNB Smart Chain Testnet",
    rpcUrl: DEFAULT_BSC_TESTNET_RPC_URL,
    foreToken: {
      address: "0xe44Ea520518CCD7709CD13BCd37161518fA2e580",
      abi: foreAbi,
    },
    predictionRegistry: {
      address: "0x09E10ac18B55faBb5ac37022EF35ecDd42594EDc",
      abi: predictionRegistryAbi,
    },
    predictionMarket: {
      address: "0xfe155C98757879dD24fF20447bf1E9E7E0e421d1",
      abi: predictionMarketAbi,
    },
    resolutionOracle: {
      address: "0xc4b9aA01fF29ee4b0D86Cd68a3B4393Ee30BfAdc",
      abi: resolutionOracleAbi,
    },
    prophetPortfolio: {
      address: "0x2F94149647D5167859131E0f905Efe9E09EAC9C5",
      abi: prophetPortfolioAbi,
    },
    socialMetrics: {
      address: "0xD5E5DDF4f998F276Bb736aBB87a6a4Abd65F0E77",
      abi: socialMetricsAbi,
    },
  },
} satisfies Record<string, NetworkConfig>;

export type SupportedNetwork = keyof typeof CONTRACTS;

type ContractKey = keyof ContractEntries;

export const ACTIVE_NETWORK: SupportedNetwork = "bscTestnet";

export const getNetworkConfig = (network: SupportedNetwork = ACTIVE_NETWORK) =>
  CONTRACTS[network];

export const getContract = <K extends ContractKey>(
  contract: K,
  network: SupportedNetwork = ACTIVE_NETWORK
) => CONTRACTS[network][contract];
