'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useAccount } from 'wagmi';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ConnectWalletButton } from '@/components/ui/connect-wallet-button';
import { createInvoice } from '@/lib/actions/invoice-actions';
import { AIGeneratedInvoice } from '@/types';
import { cn } from '@/lib/utils';
import { sendInvoicePaymentNotification } from '@/lib/services/telegram-service';

// Invoice form schema
const formSchema = z.object({
    clientName: z.string().min(1, 'Client name is required'),
    clientEmail: z.string().email('Invalid email address'),
    clientAddress: z.string().optional(),
    dueDate: z.date({
        required_error: 'Due date is required',
    }),
    notes: z.string().optional(),
    terms: z.string().optional(),
    paymentAddress: z.string().optional(),
    paymentTokenType: z.string().optional(),
    items: z.array(
        z.object({
            id: z.string(),
            description: z.string().min(1, 'Description is required'),
            quantity: z.number().min(1, 'Quantity must be at least 1'),
            unitPrice: z.number().min(0, 'Unit price must be at least 0'),
            amount: z.number().min(0, 'Amount must be at least 0'),
        })
    ).min(1, 'At least one item is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface InvoiceFormProps {
    aiGeneratedInvoice?: AIGeneratedInvoice;
}

export function InvoiceForm({ aiGeneratedInvoice }: InvoiceFormProps) {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientName: '',
            clientEmail: '',
            clientAddress: '',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            notes: '',
            terms: '',
            paymentAddress: '',
            paymentTokenType: 'ETH',
            items: [
                {
                    id: 'item-1',
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    amount: 0,
                },
            ],
        },
    });

    // Calculate total amount
    const calculateTotal = () => {
        const items = form.watch('items');
        return items.reduce((total, item) => total + Number(item.amount || 0), 0);
    };

    // Add a new item
    const addItem = () => {
        const items = form.watch('items');
        form.setValue('items', [
            ...items,
            {
                id: `item-${items.length + 1}`,
                description: '',
                quantity: 1,
                unitPrice: 0,
                amount: 0,
            },
        ]);
    };

    // Remove an item
    const removeItem = (id: string) => {
        const items = form.watch('items');
        if (items.length === 1) return; // Don't remove the last item
        form.setValue(
            'items',
            items.filter((item) => item.id !== id)
        );
    };

    // Calculate amount when quantity or unitPrice changes
    const calculateItemAmount = (index: number) => {
        const items = form.watch('items');
        const item = items[index];
        const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);
        form.setValue(`items.${index}.amount`, amount);
    };

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        try {
            setIsSubmitting(true);

            // Create FormData for server action
            const formData = new FormData();
            formData.append('clientName', data.clientName);
            formData.append('clientEmail', data.clientEmail);
            formData.append('clientAddress', data.clientAddress || '');
            formData.append('dueDate', data.dueDate.toISOString());
            formData.append('notes', data.notes || '');
            formData.append('terms', data.terms || '');
            formData.append('paymentAddress', data.paymentAddress || address || '');
            formData.append('paymentTokenType', data.paymentTokenType || 'ETH');
            formData.append('items', JSON.stringify(data.items));

            const result = await createInvoice(formData);


            if (result.success) {
                // router.push(`/dashboard/invoices/${result.id}`); 
                const invoice = result.invoice;
                if (!invoice) {
                    console.error('Invoice not found after creation');
                    return;
                }
                await sendInvoicePaymentNotification(
                    invoice
                )
                router.push(`/dashboard/invoices`);
            } else {
                // Handle error
                console.error('Failed to create invoice', result.error || result.errors);
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use AI-generated invoice if provided
    useEffect(() => {
        if (aiGeneratedInvoice) {
            form.setValue('clientName', aiGeneratedInvoice.clientName);
            form.setValue('clientEmail', aiGeneratedInvoice.clientEmail);
            form.setValue('clientAddress', aiGeneratedInvoice.clientAddress || '');
            form.setValue('dueDate', aiGeneratedInvoice.dueDate);
            form.setValue('notes', aiGeneratedInvoice.notes || '');
            form.setValue('terms', aiGeneratedInvoice.terms || '');
            form.setValue('items', aiGeneratedInvoice.items);

            // Update all item amounts
            aiGeneratedInvoice.items.forEach((_, index) => {
                calculateItemAmount(index);
            });
        }
    }, [aiGeneratedInvoice, form]);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Client Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                    <CardDescription>Enter the client details for this invoice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input
                                id="clientName"
                                placeholder="Enter client name"
                                {...form.register('clientName')}
                            />
                            {form.formState.errors.clientName && (
                                <p className="text-sm text-red-500">{form.formState.errors.clientName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientEmail">Client Email</Label>
                            <Input
                                id="clientEmail"
                                type="email"
                                placeholder="Enter client email"
                                {...form.register('clientEmail')}
                            />
                            {form.formState.errors.clientEmail && (
                                <p className="text-sm text-red-500">{form.formState.errors.clientEmail.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clientAddress">Client Address (Optional)</Label>
                        <Textarea
                            id="clientAddress"
                            placeholder="Enter client address"
                            {...form.register('clientAddress')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Items</CardTitle>
                    <CardDescription>Add items to your invoice</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {form.watch('items').map((item, index) => (
                        <div key={item.id} className="space-y-4 p-4 border rounded-lg relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => removeItem(item.id)}
                                disabled={form.watch('items').length === 1}
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            <div className="space-y-2">
                                <Label htmlFor={`items.${index}.description`}>Description</Label>
                                <Textarea
                                    id={`items.${index}.description`}
                                    placeholder="Describe the product or service"
                                    {...form.register(`items.${index}.description`)}
                                />
                                {form.formState.errors.items?.[index]?.description && (
                                    <p className="text-sm text-red-500">
                                        {form.formState.errors.items[index]?.description?.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor={`items.${index}.quantity`}>Quantity</Label>
                                    <Input
                                        id={`items.${index}.quantity`}
                                        type="number"
                                        min="1"
                                        step="1"
                                        {...form.register(`items.${index}.quantity`, {
                                            valueAsNumber: true,
                                            onChange: () => calculateItemAmount(index),
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`items.${index}.unitPrice`}>Unit Price</Label>
                                    <Input
                                        id={`items.${index}.unitPrice`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        {...form.register(`items.${index}.unitPrice`, {
                                            valueAsNumber: true,
                                            onChange: () => calculateItemAmount(index),
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`items.${index}.amount`}>Amount</Label>
                                    <Input
                                        id={`items.${index}.amount`}
                                        type="number"
                                        readOnly
                                        value={form.watch(`items.${index}.amount`)}
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addItem} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>

                    <div className="flex justify-end pt-4">
                        <div className="space-y-1 text-right">
                            <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment and Due Date */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Set payment information and due date</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !form.watch('dueDate') && "text-muted-foreground"
                                        )}
                                    >
                                        {form.watch('dueDate') ? (
                                            format(form.watch('dueDate'), "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={form.watch('dueDate')}
                                        onSelect={(date) => date && form.setValue('dueDate', date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {form.formState.errors.dueDate && (
                                <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentTokenType">Payment Token</Label>
                            <Input
                                id="paymentTokenType"
                                placeholder="ETH, USDC, etc."
                                {...form.register('paymentTokenType')}
                                defaultValue="ETH"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentAddress">Payment Address</Label>
                        {isConnected ? (
                            <Input
                                id="paymentAddress"
                                placeholder="0x..."
                                {...form.register('paymentAddress')}
                                defaultValue={address}
                            />
                        ) : (
                            <div className="pt-2">
                                <ConnectWalletButton
                                    variant="outline"
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Connect your wallet to set payment address automatically
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional notes for the client"
                            {...form.register('notes')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="terms">Terms and Conditions (Optional)</Label>
                        <Textarea
                            id="terms"
                            placeholder="Terms and conditions for this invoice"
                            {...form.register('terms')}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Invoice...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Create Invoice
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}