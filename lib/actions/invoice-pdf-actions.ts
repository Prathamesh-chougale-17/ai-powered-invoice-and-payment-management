'use server';

import { getInvoice } from '@/lib/actions/invoice-actions';
import { generateInvoicePDF } from '@/lib/services/pdf-generator';
import { Invoice } from '@/types';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';

/**
 * Generate PDF for an invoice and return as base64 string
 */
export async function generateInvoicePDFAction(id: string): Promise<{
    success: boolean;
    pdfBase64?: string;
    filename?: string;
    error?: string;
}> {
    try {
        if (!id || !ObjectId.isValid(id)) {
            return {
                success: false,
                error: 'Invalid invoice ID'
            };
        }

        // Get the invoice data
        const { success, invoice, error } = await getInvoice(id);

        if (!success || !invoice) {
            return {
                success: false,
                error: error || 'Invoice not found'
            };
        }

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF(invoice as unknown as Invoice);

        // Convert to base64
        const pdfBase64 = pdfBuffer.toString('base64');

        // Create filename
        const filename = `invoice-${invoice.number}.pdf`;

        return {
            success: true,
            pdfBase64,
            filename
        };
    } catch (error) {
        console.error('Error generating PDF:', error);
        return {
            success: false,
            error: 'Failed to generate PDF'
        };
    }
}

/**
 * Download PDF for an invoice (for use with form action)
 */
export async function downloadInvoicePDF(formData: FormData): Promise<void> {
    try {
        const id = formData.get('invoiceId') as string;

        if (!id || !ObjectId.isValid(id)) {
            throw new Error('Invalid invoice ID');
        }

        // Store the ID in a cookie to be used by the download page
        (await
            // Store the ID in a cookie to be used by the download page
            cookies()).set('download_invoice_id', id, {
                maxAge: 60 * 5, // 5 minutes
                path: '/',
            });

        // Redirect to download page will happen in the client component
    } catch (error) {
        console.error('Error preparing PDF download:', error);
        throw error;
    }
}