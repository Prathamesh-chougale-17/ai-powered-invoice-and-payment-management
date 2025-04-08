'use server';

import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getTransactionsCollection } from '@/lib/db';
import { TransactionStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { markInvoiceAsPaid } from './invoice-actions';

// Zod schema for creating a transaction
const CreateTransactionSchema = z.object({
    amount: z.number().min(0, 'Amount must be at least 0'),
    tokenType: z.string().min(1, 'Token type is required'),
    fromAddress: z.string().min(1, 'From address is required'),
    toAddress: z.string().min(1, 'To address is required'),
    hash: z.string().min(1, 'Transaction hash is required'),
    invoiceId: z.string().optional(),
    description: z.string().optional(),
    networkId: z.number(),
});

// Function to create a new transaction
export async function createTransaction(formData: FormData) {
    try {
        // Parse form data
        const rawData = Object.fromEntries(formData.entries());

        // Create transaction object
        const transactionData = {
            amount: parseFloat(rawData.amount as string),
            tokenType: rawData.tokenType as string,
            fromAddress: rawData.fromAddress as string,
            toAddress: rawData.toAddress as string,
            hash: rawData.hash as string,
            invoiceId: rawData.invoiceId as string,
            description: rawData.description as string,
            networkId: parseInt(rawData.networkId as string),
        };

        // Validate with Zod
        const validatedData = CreateTransactionSchema.parse(transactionData);

        // Get transactions collection
        const transactionsCollection = await getTransactionsCollection();

        // Create transaction in database
        const result = await transactionsCollection.insertOne({
            ...validatedData,
            createdAt: new Date(),
            status: TransactionStatus.CONFIRMED,
            userId: 'user-id', // Replace with actual user ID from auth
        });

        // If this is for an invoice, mark the invoice as paid
        if (validatedData.invoiceId) {
            await markInvoiceAsPaid(validatedData.invoiceId, validatedData.hash);
        }

        revalidatePath('/dashboard/transactions');
        return { success: true, id: result.insertedId.toString() };
    } catch (error) {
        console.error('Error creating transaction:', error);
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.errors };
        }
        return { success: false, error: 'Failed to create transaction' };
    }
}

// Function to get all transactions
export async function getTransactions() {
    try {
        const transactionsCollection = await getTransactionsCollection();
        const transactions = await transactionsCollection.find({
            // userId: 'user-id', // Replace with actual user ID from auth
        }).sort({ createdAt: -1 }).toArray();

        return { success: true, transactions };
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return { success: false, error: 'Failed to fetch transactions' };
    }
}

// Function to get a single transaction
export async function getTransaction(id: string) {
    try {
        const transactionsCollection = await getTransactionsCollection();
        const transaction = await transactionsCollection.findOne({
            _id: new ObjectId(id),
            // userId: 'user-id', // Replace with actual user ID from auth
        });

        if (!transaction) {
            return { success: false, error: 'Transaction not found' };
        }

        return { success: true, transaction };
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return { success: false, error: 'Failed to fetch transaction' };
    }
}

// Function to update transaction status
export async function updateTransactionStatus(id: string, status: TransactionStatus) {
    try {
        const transactionsCollection = await getTransactionsCollection();

        await transactionsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );

        revalidatePath('/dashboard/transactions');
        return { success: true };
    } catch (error) {
        console.error('Error updating transaction status:', error);
        return { success: false, error: 'Failed to update transaction status' };
    }
}

// Function to track a wallet transaction by hash
export async function trackWalletTransaction(hash: string, networkId: number) {
    try {
        const transactionsCollection = await getTransactionsCollection();

        // Check if transaction already exists
        const existingTransaction = await transactionsCollection.findOne({
            hash,
            networkId,
        });

        if (existingTransaction) {
            return { success: true, transaction: existingTransaction, exists: true };
        }

        // In a real application, you would call a blockchain API to get the transaction details
        // For this example, we'll simulate it

        // Simulate blockchain API call
        // In production, you would use a library like viem or ethers.js to get the actual transaction
        const transaction = {
            hash,
            networkId,
            fromAddress: '0x' + '1'.repeat(40), // Simulated address
            toAddress: '0x' + '2'.repeat(40), // Simulated address
            amount: 0.1, // Simulated amount
            tokenType: 'ETH', // Simulated token
            status: TransactionStatus.CONFIRMED,
            createdAt: new Date(),
            userId: 'user-id', // Replace with actual user ID from auth
        };

        // Insert the transaction
        const result = await transactionsCollection.insertOne(transaction);

        revalidatePath('/dashboard/transactions');
        return { success: true, id: result.insertedId.toString(), transaction, exists: false };
    } catch (error) {
        console.error('Error tracking wallet transaction:', error);
        return { success: false, error: 'Failed to track wallet transaction' };
    }
}