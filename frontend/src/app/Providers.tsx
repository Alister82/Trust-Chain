'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, localhost } from 'wagmi/chains';
import { injected, metaMask } from 'wagmi/connectors';
import { ReactNode, useState } from 'react';

// We define our "Localhost" chain specifically for Anvil
const config = createConfig({
  chains: [localhost, mainnet],
  ssr: true,
  connectors: [
    injected(),
  ],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
