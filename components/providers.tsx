'use client';

import { ThemeProvider } from 'next-themes';
import {
    getDefaultConfig,
    RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia,
    goerli,
    localhost,
    hardhat,
    polygonMumbai,
    avalanche,
} from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { ReactNode } from 'react';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from './ui/sonner';

interface ProvidersProps {
    children: ReactNode;
}

const config = getDefaultConfig({
    appName: 'My RainbowKit App',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'default',
    chains: [mainnet, polygon, optimism, arbitrum, base, sepolia, goerli, localhost, hardhat, polygonMumbai, avalanche],
    ssr: true, // If your dApp uses server side rendering (SSR)
});

export function Providers({ children }: ProvidersProps) {
    const queryClient = new QueryClient();
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider>
                        {children}
                        <Toaster />
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </ThemeProvider>
    );
}