'use client';

import { useState } from 'react';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Send, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Invoice } from '@/types';
import { initiatePayment } from '@/lib/actions/payment-actions';
import { formatCurrency } from '@/lib/utils';

interface PayNowButtonProps {
    invoice: Invoice;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
    onPaymentComplete?: () => void;
}

export function PayNowButton({
    invoice,
    variant = 'default',
    size = 'sm',
    className,
    onPaymentComplete
}: PayNowButtonProps) {
    const [open, setOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'sending' | 'confirming' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);

    const { address, isConnected, chain } = useAccount();

    // Get user balance
    const { data: balance } = useBalance({
        address,
    });

    // Transaction hook
    const { sendTransactionAsync } = useSendTransaction();

    // Check if enough balance
    const hasEnoughBalance = balance && invoice && balance.value >= parseEther(invoice.totalAmount.toString() as `${number}`);

    // Reset state when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            // Only reset if not successful
            if (status !== 'success') {
                setStatus('idle');
                setErrorMessage(null);
                setTransactionHash(null);
            }
        }
    };

    const handlePayment = async () => {
        if (!address || !chain || !invoice.paymentAddress) {
            setErrorMessage('Missing wallet address or payment address');
            setStatus('error');
            return;
        }

        try {
            setIsProcessing(true);
            setStatus('sending');
            setErrorMessage(null);

            // Send the transaction
            const hash = await sendTransactionAsync({
                to: invoice.paymentAddress as `0x${string}`,
                value: parseEther(invoice.totalAmount.toString() as `${number}`),
            });

            if (!hash) {
                throw new Error('Transaction failed');
            }

            setTransactionHash(hash);
            setStatus('confirming');

            // Create form data for payment record
            const formData = new FormData();
            formData.append('invoiceId', invoice.id);
            formData.append('fromAddress', address);
            formData.append('hash', hash);
            formData.append('networkId', chain.id.toString());

            // Record the payment
            const result = await initiatePayment(formData);

            if (!result.success) {
                throw new Error('Failed to record payment');
            }

            setStatus('success');

            // Call the onPaymentComplete callback
            if (onPaymentComplete) {
                onPaymentComplete();
            }
        } catch (error) {
            console.error('Payment error:', error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    // If not connected, don't show the button
    if (!isConnected) {
        return null;
    }

    // Get transaction explorer URL for current chain
    const getExplorerUrl = (hash: string) => {
        if (!chain) return '#';

        const explorers: Record<number, string> = {
            1: 'https://etherscan.io/tx/',
            137: 'https://polygonscan.com/tx/',
            10: 'https://optimistic.etherscan.io/tx/',
            42161: 'https://arbiscan.io/tx/',
            8453: 'https://basescan.org/tx/',
            56: 'https://bscscan.com/tx/',
            43114: 'https://snowtrace.io/tx/',
            324: 'https://explorer.zksync.io/tx/',
            100: 'https://gnosisscan.io/tx/',
            1101: 'https://zkevm.polygonscan.com/tx/',
            314: 'https://filfox.info/en/message/',
            42220: 'https://explorer.celo.org/mainnet/tx/',
            11155111: 'https://sepolia.etherscan.io/tx/',
            534351: 'https://sepolia.scrollscan.com/tx/',
        };

        const baseUrl = explorers[chain.id] || 'https://etherscan.io/tx/';
        return `${baseUrl}${hash}`;
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={className}
                >
                    <Send className="mr-2 h-4 w-4" />
                    Pay Now
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Pay Invoice</DialogTitle>
                    <DialogDescription>
                        Send payment for invoice #{invoice.number}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Payment details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Amount</Label>
                            <p className="font-medium mt-1">{formatCurrency(invoice.totalAmount)}</p>
                        </div>
                        <div>
                            <Label>Token</Label>
                            <p className="font-medium mt-1">{invoice.paymentTokenType || 'ETH'}</p>
                        </div>
                        <div className="col-span-2">
                            <Label>Recipient Address</Label>
                            <p className="font-medium mt-1 break-all text-sm">
                                {invoice.paymentAddress || 'No payment address specified'}
                            </p>
                        </div>
                    </div>

                    {/* Balance warning */}
                    {balance && !hasEnoughBalance && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Insufficient balance</AlertTitle>
                            <AlertDescription>
                                Your current balance is {formatEther(balance.value)} {balance.symbol},
                                but this payment requires {invoice.totalAmount} {invoice.paymentTokenType || 'ETH'}.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Network info */}
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Payment Network</AlertTitle>
                        <AlertDescription>
                            This payment will be made on the {chain?.name || 'current'} network.
                            Make sure the recipient address is valid on this network.
                        </AlertDescription>
                    </Alert>

                    {/* Transaction status */}
                    {status === 'sending' && (
                        <Alert>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertTitle>Sending Payment</AlertTitle>
                            <AlertDescription>
                                Please confirm the transaction in your wallet...
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === 'confirming' && (
                        <Alert>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertTitle>Confirming Transaction</AlertTitle>
                            <AlertDescription>
                                Waiting for blockchain confirmation...
                                {transactionHash && (
                                    <div className="mt-2">
                                        <a
                                            href={getExplorerUrl(transactionHash)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline text-sm"
                                        >
                                            View on Explorer
                                        </a>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === 'success' && (
                        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle>Payment Successful</AlertTitle>
                            <AlertDescription>
                                Your payment has been sent and recorded.
                                {transactionHash && (
                                    <div className="mt-2">
                                        <a
                                            href={getExplorerUrl(transactionHash)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary underline text-sm"
                                        >
                                            View on Explorer
                                        </a>
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {status === 'error' && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Payment Failed</AlertTitle>
                            <AlertDescription>
                                {errorMessage || 'There was an error processing your payment. Please try again.'}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    {status === 'success' ? (
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    ) : (
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing || !hasEnoughBalance || status === 'confirming'}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Confirm Payment
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}