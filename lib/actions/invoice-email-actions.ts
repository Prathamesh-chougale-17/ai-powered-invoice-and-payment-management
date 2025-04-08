'use server';

import { z } from 'zod';
import { getInvoice } from '@/lib/actions/invoice-actions';
import { sendInvoiceEmail, sendPaymentConfirmationEmail } from '@/lib/services/email-service';
import { Invoice, InvoiceStatus } from '@/types';

// Schema for email request
const EmailRequestSchema = z.object({
    invoiceId: z.string().min(1, 'Invoice ID is required'),
    senderEmail: z.string().email('Invalid sender email'),
    senderName: z.string().min(1, 'Sender name is required'),
    emailType: z.enum(['invoice', 'payment']),
    attachPDF: z.boolean().optional().default(true),
});

type EmailRequestData = z.infer<typeof EmailRequestSchema>;

/**
 * Send invoice email
 */
export async function sendInvoiceEmailAction(formData: FormData): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    errors?: Record<string, string>;
}> {
    try {
        // Parse form data
        const rawData = Object.fromEntries(formData.entries());

        // Create data object
        const data: EmailRequestData = {
            invoiceId: rawData.invoiceId as string,
            senderEmail: rawData.senderEmail as string,
            senderName: rawData.senderName as string,
            emailType: (rawData.emailType as 'invoice' | 'payment') || 'invoice',
            attachPDF: rawData.attachPDF === 'true',
        };

        // Validate data
        const validationResult = EmailRequestSchema.safeParse(data);

        if (!validationResult.success) {
            return {
                success: false,
                errors: validationResult.error.errors.reduce((acc, error) => {
                    acc[error.path.join('.')] = error.message;
                    return acc;
                }, {} as Record<string, string>),
            };
        }

        const validatedData = validationResult.data;

        // Get the invoice data
        const { success, invoice, error } = await getInvoice(validatedData.invoiceId);

        if (!success || !invoice) {
            return {
                success: false,
                error: error || 'Invoice not found',
            };
        }

        // Send the appropriate email
        let emailResult;

        if (validatedData.emailType === 'invoice') {
            emailResult = await sendInvoiceEmail(
                invoice as unknown as Invoice,
                validatedData.senderEmail,
                validatedData.senderName,
                validatedData.attachPDF
            );
        } else if (validatedData.emailType === 'payment') {
            // Only allow payment confirmation emails for paid invoices
            if (invoice.status !== InvoiceStatus.PAID) {
                return {
                    success: false,
                    error: 'Cannot send payment confirmation for unpaid invoice',
                };
            }

            emailResult = await sendPaymentConfirmationEmail(
                invoice as unknown as Invoice,
                validatedData.senderEmail,
                validatedData.senderName
            );
        }

        if (!emailResult?.success) {
            return {
                success: false,
                error: emailResult?.error || 'Failed to send email',
            };
        }

        return {
            success: true,
            messageId: emailResult.messageId,
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: 'Failed to send email',
        };
    }
}