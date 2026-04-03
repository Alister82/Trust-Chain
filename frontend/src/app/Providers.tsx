'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains'; // Remove localhost import
import { ReactNode, useState, useEffect } from 'react';
import { injected } from 'wagmi/connectors';

// 1. Explicitly define Anvil so the Provider knows exactly what to look for
const anvil = {
  id: 31337,
  name: 'Anvil',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
} as const;

export const config = createConfig({
  chains: [anvil, mainnet],
  ssr: true, // Keep this true for Next.js
  connectors: [injected()],
  transports: {
    [anvil.id]: http(),
    [mainnet.id]: http(),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  // 2. Fix the "Hydration" Error: 
  // This ensures the blockchain logic only runs after the browser is ready
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; 

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
