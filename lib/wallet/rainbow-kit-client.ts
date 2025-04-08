'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    sepolia
} from 'wagmi/chains';
import { http } from 'viem';

// Configuring supported chains and providers for Rainbow Kit
export const config = getDefaultConfig({
    appName: 'AI Finance Assistant',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
    chains: [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    ],
    transports: process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true'
        ? {
            [mainnet.id]: http(),
            [polygon.id]: http(),
            [optimism.id]: http(),
            [arbitrum.id]: http(),
            [base.id]: http(),
            [sepolia.id]: http(),
        }
        : {
            [mainnet.id]: http(),
            [polygon.id]: http(),
            [optimism.id]: http(),
            [arbitrum.id]: http(),
            [base.id]: http(),
        },
    ssr: true,
});

export const supportedChains = [
    { id: mainnet.id, name: 'Ethereum', icon: '/chains/ethereum.svg' },
    { id: polygon.id, name: 'Polygon', icon: '/chains/polygon.svg' },
    { id: optimism.id, name: 'Optimism', icon: '/chains/optimism.svg' },
    { id: arbitrum.id, name: 'Arbitrum', icon: '/chains/arbitrum.svg' },
    { id: base.id, name: 'Base', icon: '/chains/base.svg' },
];

// C