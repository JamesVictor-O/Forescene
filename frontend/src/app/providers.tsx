"use client";

import { PrivyProvider } from "@privy-io/react-auth";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
const privyClientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID!;

export default function Providers({ children }: { children: React.ReactNode }) {
    console.log(privyAppId, privyClientId);
  if (!privyAppId || !privyClientId) {
    console.error("Privy env vars are missing");
    return children;
  }

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
      {children}
    </PrivyProvider>
  );
}
