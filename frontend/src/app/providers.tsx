"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { defineChain } from "viem";

import { getNetworkConfig } from "@/config/contracts";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const privyClientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;
  const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

  const network = getNetworkConfig();

  const chain = useMemo(
    () =>
      defineChain({
        id: network.chainId,
        name: network.name,
        nativeCurrency: {
          decimals: 18,
          name: "BNB",
          symbol: "tBNB",
        },
        rpcUrls: {
          default: {
            http: [network.rpcUrl],
          },
        },
        blockExplorers: {
          default: {
            name: "BscScan Testnet",
            url: "https://testnet.bscscan.com",
          },
        },
        testnet: true,
      }),
    [network.chainId, network.name, network.rpcUrl]
  );

  const wagmiConfig = useMemo(
    () =>
      getDefaultConfig({
        appName: "Forescene",
        projectId: walletConnectProjectId,
        chains: [chain],
        ssr: true,
      }),
    [chain, walletConnectProjectId]
  );

  if (!privyAppId || !privyClientId) {
    console.error("Privy env vars are missing");
    return children;
  }
  console.log(privyAppId, privyClientId, walletConnectProjectId);

  return (
    <PrivyProvider
      appId={privyAppId}
      clientId={privyClientId}
      config={{
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider initialChain={chain} locale="en-US">
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
