'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useTransaction, } from 'wagmi';
import {
    Send,
    Loader2,
    ExternalLink,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConnectWalletButton } from '@/components/ui/connect-wallet-button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { initiatePayment } from '@/lib/actions/payment-actions';
import { Invoice, InvoiceStatus } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Payment form schema
const formSchema = z.object({
    hash: z.string().min(1, 'Transaction hash is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
    invoice: Invoice;
}

export function PaymentForm({ invoice }: PaymentFormProps) {
    const router = useRouter();
    const { address, isConnected, chain } = useAccount();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string | null>(null);

    // Initialize form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            hash: '',
        },
    });

    // Monitor transaction if hash is provided
    const {
        // data: transactionData,
        // isError: transactionError,
        isLoading: isTransactionLoading,
        isSuccess: transactionSuccess
    } = useTransaction({
        hash: transactionHash as `0x${string}`,
    });

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            setIsSubmitting(true);

            // Create FormData for server action
            const formData = new FormData();
            formData.append('invoiceId', invoice.id);
            formData.append('fromAddress', address || '');
            formData.append('hash', data.hash);
            formData.append('networkId', (chain?.id || 1).toString());

            const result = await initiatePayment(formData);

            if (result.success) {
                setTransactionHash(data.hash);
                router.refresh();
            } else {
                // Handle error
                console.error('Failed to process payment', result.error);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to get explorer URL
    const getExplorerUrl = (hash: string) => {
        if (!chain?.blockExplorers?.default.url) {
            return `https://etherscan.io/tx/${hash}`;
        }
        return `${chain.blockExplorers.default.url}/tx/${hash}`;
    };

    // If invoice is already paid, show paid status
    if (invoice.status === InvoiceStatus.PAID) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Payment Complete
                    </CardTitle>
                    <CardDescription>
                        This invoice has been paid successfully
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                                    Payment confirmed
                                </h3>
                                <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                                    <p>Transaction Hash: {invoice.transactionHash}</p>
                                    <p className="mt-1">Paid on: {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'Unknown'}</p>
                                </div>
                                {invoice.transactionHash && (
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-green-700 border-green-700 hover:bg-green-50 dark:text-green-400 dark:border-green-400"
                                            asChild
                                        >
                                            <a
                                                href={getExplorerUrl(invoice.transactionHash)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Transaction
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>
                        Pay this invoice using cryptocurrency
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!isConnected ? (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Wallet Required</AlertTitle>
                                <AlertDescription>
                                    Please connect your wallet to make a payment.
                                </AlertDescription>
                            </Alert>
                            <ConnectWalletButton
                                variant="default"
                                size="lg"
                                className="w-full md:w-auto"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="rounded-lg bg-muted p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                        <p className="font-semibold">{invoice.totalAmount} {invoice.paymentTokenType || 'ETH'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                                        <p className="font-mono text-sm break-all">
                                            {invoice.paymentAddress || 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!transactionHash ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="hash">Transaction Hash</Label>
                                        <Input
                                            id="hash"
                                            placeholder="0x..."
                                            {...form.register('hash')}
                                            disabled={isSubmitting}
                                        />
                                        {form.formState.errors.hash && (
                                            <p className="text-sm text-red-500">{form.formState.errors.hash.message}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Paste the transaction hash after sending payment to {invoice.paymentAddress}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {isTransactionLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                            ) : transactionSuccess ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium">
                                                {isTransactionLoading
                                                    ? 'Confirming transaction'
                                                    : transactionSuccess
                                                        ? 'Transaction confirmed'
                                                        : 'Transaction failed'}
                                            </h3>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <p className="font-mono break-all">{transactionHash}</p>
                                            </div>
                                            <div className="mt-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <a
                                                        href={getExplorerUrl(transactionHash)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                        View on Explorer
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
                {isConnected && !transactionHash && (
                    <CardFooter>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isConnected}
                            className="w-full"
                        >
                            {isSubmitting ? (
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
                    </CardFooter>
                )}
            </Card>
        </form>
    );
}