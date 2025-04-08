'use client';

import { supportedChains } from '@/lib/wallet/rainbow-kit-client';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ExternalLink } from 'lucide-react';

export function SupportedNetworks() {
    // Group chains by category
    const mainnetChains = supportedChains.filter(chain =>
        !chain.name.toLowerCase().includes('testnet') &&
        !chain.name.toLowerCase().includes('sepolia')
    );

    const testnetChains = supportedChains.filter(chain =>
        chain.name.toLowerCase().includes('testnet') ||
        chain.name.toLowerCase().includes('sepolia')
    );

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Mainnet Networks</h3>
                <div className="flex flex-wrap gap-2">
                    {mainnetChains.map(chain => (
                        <NetworkBadge key={chain.id} chain={chain} />
                    ))}
                </div>
            </div>

            {testnetChains.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Testnet Networks</h3>
                    <div className="flex flex-wrap gap-2">
                        {testnetChains.map(chain => (
                            <NetworkBadge key={chain.id} chain={chain} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground">
                <p>These networks are supported for invoice payments and transaction tracking.</p>
            </div>
        </div>
    );
}

interface NetworkBadgeProps {
    chain: {
        id: number;
        name: string;
        icon: string;
    };
}

function NetworkBadge({ chain }: NetworkBadgeProps) {
    const getExplorerUrl = (chainId: number) => {
        const explorers: Record<number, string> = {
            1: 'https://etherscan.io',
            137: 'https://polygonscan.com',
            10: 'https://optimistic.etherscan.io',
            42161: 'https://arbiscan.io',
            8453: 'https://basescan.org',
            56: 'https://bscscan.com',
            43114: 'https://snowtrace.io',
            324: 'https://explorer.zksync.io',
            100: 'https://gnosisscan.io',
            1101: 'https://zkevm.polygonscan.com',
            314: 'https://filfox.info/en',
            42220: 'https://explorer.celo.org/mainnet',
            11155111: 'https://sepolia.etherscan.io',
            534351: 'https://sepolia.scrollscan.com',
        };

        return explorers[chainId] || '#';
    };

    const explorerUrl = getExplorerUrl(chain.id);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        <div className="h-4 w-4 rounded-full bg-muted"></div>
                        {chain.name}
                        {explorerUrl !== '#' && (
                            <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Chain ID: {chain.id}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}