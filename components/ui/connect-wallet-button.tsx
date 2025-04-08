'use client';

// import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConnectWalletButtonProps {
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showBalance?: boolean;
}

export function ConnectWalletButton({
    variant = 'default',
    size = 'default',
    className,
    showBalance = true,
}: ConnectWalletButtonProps) {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
            }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === 'authenticated');

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            'style': {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <Button
                                        variant={variant}
                                        size={size}
                                        className={className}
                                        onClick={openConnectModal}
                                    >
                                        Connect Wallet
                                    </Button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <Button
                                        variant="destructive"
                                        size={size}
                                        className={className}
                                        onClick={openChainModal}
                                    >
                                        Wrong Network
                                    </Button>
                                );
                            }

                            return (
                                <div className="flex items-center gap-2">
                                    {showBalance && (
                                        <Button
                                            variant="outline"
                                            size={size}
                                            className={cn("mr-1", className)}
                                            onClick={openChainModal}
                                        >
                                            {account.displayBalance
                                                ? `${account.displayBalance}`
                                                : ''}
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        size={size}
                                        className={className}
                                        onClick={openAccountModal}
                                    >
                                        {account.displayName}
                                    </Button>
                                </div>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}