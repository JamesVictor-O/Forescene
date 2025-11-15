//

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { createConfig } from "wagmi";
import { foresceneBscTestnet } from "@/config/chains";
import { http } from "viem";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const rpcUrl = foresceneBscTestnet.rpcUrls.default.http[0];


  const wagmiConfig = useMemo(
    () =>
      createConfig({
        chains: [foresceneBscTestnet],
        transports: {
          [foresceneBscTestnet.id]: http(rpcUrl, {
            timeout: 30_000,
            retryCount: 3,
          }),
        },
      }),
    [rpcUrl]
  );

  if (!privyAppId) {
    console.error("Privy app ID is missing");
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        supportedChains: [foresceneBscTestnet],
        loginMethods: ["wallet", "email", "sms"],
        defaultChain: foresceneBscTestnet,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
