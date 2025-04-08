'use server';

import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getInvoicesCollection } from '@/lib/db';
import { InvoiceStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { generateAIInvoice } from '@/lib/ai/invoice-generator';

// Zod schema for creating an invoice
const InvoiceItemSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be at least 0'),
    amount: z.number().min(0, 'Amount must be at least 0'),
});

const CreateInvoiceSchema = z.object({
    clientName: z.string().min(1, 'Client name is required'),
    clientEmail: z.string().email('Invalid email address'),
    clientAddress: z.string().optional(),
    items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
    notes: z.string().optional(),
    terms: z.string().optional(),
    dueDate: z.date(),
    paymentAddress: z.string().optional(),
    paymentTokenType: z.string().optional(),
});

// Function to create a new invoice
export async function createInvoice(formData: FormData) {
    try {
        // Parse form data
        const rawData = Object.fromEntries(formData.entries());
        const itemsData = JSON.parse(rawData.items as string);

        // Convert due date string to Date
        const dueDate = new Date(rawData.dueDate as string);

        // Calculate total amount
        const totalAmount = itemsData.reduce(
            (total: number, item: {
                amount: number;
            }) => total + item.amount,
            0
        );

        // Create invoice object
        const invoiceData = {
            clientName: rawData.clientName,
            clientEmail: rawData.clientEmail,
            clientAddress: rawData.clientAddress,
            items: itemsData,
            notes: rawData.notes,
            terms: rawData.terms,
            dueDate,
            paymentAddress: rawData.paymentAddress,
            paymentTokenType: rawData.paymentTokenType,
        };

        // Validate with Zod
        const validatedData = CreateInvoiceSchema.parse(invoiceData);

        // Get invoices collection
        const invoicesCollection = await getInvoicesCollection();

        // Create invoice in database
        const result = await invoicesCollection.insertOne({
            ...validatedData,
            number: generateInvoiceNumber(),
            createdAt: new Date(),
            status: InvoiceStatus.PENDING,
            totalAmount,
            userId: 'user-id', // Replace with actual user ID from auth
        });

        revalidatePath('/dashboard/invoices');
        return { success: true, id: result.insertedId.toString() };
    } catch (error) {
        console.error('Error creating invoice:', error);
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.errors };
        }
        return { success: false, error: 'Failed to create invoice' };
    }
}

// Function to get all invoices
export async function getInvoices() {
    try {
        const invoicesCollection = await getInvoicesCollection();
        const invoices = await invoicesCollection.find({
            // userId: 'user-id', // Replace with actual user ID from auth
        }).sort({ createdAt: -1 }).toArray();

        return { success: true, invoices };
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return { success: false, error: 'Failed to fetch invoices' };
    }
}

// Function to get a single invoice
export async function getInvoice(id: string) {
    try {
        const invoicesCollection = await getInvoicesCollection();
        const invoice = await invoicesCollection.findOne({
            _id: new ObjectId(id),
            // userId: 'user-id', // Replace with actual user ID from auth
        });

        if (!invoice) {
            return { success: false, error: 'Invoice not found' };
        }

        return { success: true, invoice };
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return { success: false, error: 'Failed to fetch invoice' };
    }
}

// Function to update invoice status
export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
    try {
        const invoicesCollection = await getInvoicesCollection();

        const updateData: {
            status: InvoiceStatus;
            paidAt?: Date;
        } = { status };

        // If status is PAID, set paidAt field
        if (status === InvoiceStatus.PAID) {
            updateData.paidAt = new Date();
        }

        await invoicesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        revalidatePath('/dashboard/invoices');
        return { success: true };
    } catch (error) {
        console.error('Error updating invoice status:', error);
        return { success: false, error: 'Failed to update invoice status' };
    }
}

// Function to mark invoice as paid with transaction hash
export async function markInvoiceAsPaid(id: string, transactionHash: string) {
    try {
        const invoicesCollection = await getInvoicesCollection();

        await invoicesCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: InvoiceStatus.PAID,
                    paidAt: new Date(),
                    transactionHash
                }
            }
        );

        revalidatePath('/dashboard/invoices');
        return { success: true };
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        return { success: false, error: 'Failed to mark invoice as paid' };
    }
}

// Function to delete an invoice
export async function deleteInvoice(id: string) {
    try {
        const invoicesCollection = await getInvoicesCollection();

        await invoicesCollection.deleteOne({
            _id: new ObjectId(id),
            // userId: 'user-id', // Replace with actual user ID from auth
        });

        revalidatePath('/dashboard/invoices');
        return { success: true };
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return { success: false, error: 'Failed to delete invoice' };
    }
}

// Function to generate an invoice with AI
export async function generateAIInvoiceAction(prompt: string) {
    try {
        const aiInvoice = await generateAIInvoice(prompt);
        return { success: true, invoice: aiInvoice };
    } catch (error) {
        console.error('Error generating AI invoice:', error);
        return { success: false, error: 'Failed to generate invoice with AI' };
    }
}

// Helper function to generate invoice number
function generateInvoiceNumber() {
    const prefix = 'INV';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}