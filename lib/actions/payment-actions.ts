'use server';

import { z } from 'zod';
import { createTransaction } from './transaction-actions';
import { getInvoice } from './invoice-actions';

// Zod schema for initiating a payment
const InitiatePaymentSchema = z.object({
    invoiceId: z.string().min(1, 'Invoice ID is required'),
    fromAddress: z.string().min(1, 'From address is required'),
    hash: z.string().min(1, 'Transaction hash is required'),
    networkId: z.number(),
});

// Function to initiate a payment for an invoice
export async function initiatePayment(formData: FormData) {
    try {
        // Parse form data
        const rawData = Object.fromEntries(formData.entries());

        // Create payment data object
        const paymentData = {
            invoiceId: rawData.invoiceId as string,
            fromAddress: rawData.fromAddress as string,
            hash: rawData.hash as string,
            networkId: parseInt(rawData.networkId as string),
        };

        // Validate with Zod
        const validatedData = InitiatePaymentSchema.parse(paymentData);

        // Get the invoice details
        const invoiceResult = await getInvoice(validatedData.invoiceId);

        if (!invoiceResult.success || !invoiceResult.invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        const invoice = invoiceResult.invoice;

        // Create a transaction for this payment
        const transactionFormData = new FormData();
        transactionFormData.append('amount', invoice.totalAmount.toString());
        transactionFormData.append('tokenType', invoice.paymentTokenType || 'ETH');
        transactionFormData.append('fromAddress', validatedData.fromAddress);
        transactionFormData.append('toAddress', invoice.paymentAddress || '');
        transactionFormData.append('hash', validatedData.hash);
        transactionFormData.append('invoiceId', validatedData.invoiceId);
        transactionFormData.append('description', `Payment for invoice ${invoice.number}`);
        transactionFormData.append('networkId', validatedData.networkId.toString());

        const transactionResult = await createTransaction(transactionFormData);

        if (!transactionResult.success) {
            return { success: false, error: 'Failed to create transaction record' };
        }

        return { success: true, transactionId: transactionResult.id };
    } catch (error) {
        console.error('Error initiating payment:', error);
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.errors };
        }
        return { success: false, error: 'Failed to initiate payment' };
    }
}

// Function to validate a transaction for an invoice
export async function validatePayment(invoiceId: string, transactionHash: string) {
    try {
        // In a real application, you would verify the transaction on the blockchain
        // For this example, we'll just simulate it

        // Get the invoice details
        const invoiceResult = await getInvoice(invoiceId);

        if (!invoiceResult.success || !invoiceResult.invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        // Simulate blockchain validation
        const isValid = true; // In production, verify the transaction exists and matches the invoice amount

        if (!isValid) {
            return { success: false, error: 'Transaction validation failed' };
        }

        return { success: true, verified: true };
    } catch (error) {
        console.error('Error validating payment:', error);
        return { success: false, error: 'Failed to validate payment' };
    }
}