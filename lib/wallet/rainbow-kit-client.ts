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