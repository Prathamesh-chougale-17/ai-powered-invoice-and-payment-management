import nodemailer from 'nodemailer';
import { Invoice } from '@/types';
import { generateInvoicePDF } from './pdf-generator';
import { format } from 'date-fns';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Send an invoice email to a client
 */
export async function sendInvoiceEmail(
    invoice: Invoice,
    senderEmail: string,
    senderName: string,
    attachPDF: boolean = true
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        // Generate invoice PDF if requested
        let attachments = [];

        if (attachPDF) {
            const pdfBuffer = await generateInvoicePDF(invoice);
            attachments.push({
                filename: `invoice-${invoice.number}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            });
        }

        // Format dates
        const invoiceDate = format(new Date(invoice.createdAt), 'MMMM dd, yyyy');
        const dueDate = format(new Date(invoice.dueDate), 'MMMM dd, yyyy');

        // Build email HTML
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: right; padding-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">AI Finance Assistant</h2>
          <p style="color: #666; margin: 0;">Blockchain-Powered Invoicing</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; color: #333;">INVOICE</h1>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <p style="font-weight: bold; margin-bottom: 5px;">Bill To:</p>
            <p style="margin: 0;">${invoice.clientName}</p>
            <p style="margin: 0;">${invoice.clientEmail}</p>
            ${invoice.clientAddress ? `<p style="margin: 0;">${invoice.clientAddress}</p>` : ''}
          </div>
          
          <div>
            <table style="text-align: right;">
              <tr>
                <td style="font-weight: bold; padding-right: 10px;">Invoice Number:</td>
                <td>${invoice.number}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding-right: 10px;">Invoice Date:</td>
                <td>${invoiceDate}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding-right: 10px;">Due Date:</td>
                <td>${dueDate}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding-right: 10px;">Status:</td>
                <td>${invoice.status.toUpperCase()}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Quantity</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Unit Price</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${item.description}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${item.unitPrice.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="border: 1px solid #ddd; padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: right; font-weight: bold;">${invoice.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        ${invoice.notes ? `
          <div style="margin-bottom: 20px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Notes:</p>
            <p style="margin: 0;">${invoice.notes}</p>
          </div>
        ` : ''}
        
        ${invoice.terms ? `
          <div style="margin-bottom: 20px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Terms and Conditions:</p>
            <p style="margin: 0;">${invoice.terms}</p>
          </div>
        ` : ''}
        
        ${invoice.paymentAddress ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Payment Information:</p>
            <p style="margin: 0;">Payment Address: ${invoice.paymentAddress}</p>
            ${invoice.paymentTokenType ? `<p style="margin: 0;">Token: ${invoice.paymentTokenType}</p>` : ''}
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automatically generated email. Please do not reply to this email.</p>
          <p>Generated by AI Finance Assistant on ${format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </div>
    `;

        // Send the email
        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: invoice.clientEmail,
            subject: `Invoice #${invoice.number} from ${senderName}`,
            html: emailHtml,
            attachments,
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending invoice email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email'
        };
    }
}

/**
 * Send a payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
    invoice: Invoice,
    senderEmail: string,
    senderName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        // Format dates
        const paymentDate = invoice.paidAt
            ? format(new Date(invoice.paidAt), 'MMMM dd, yyyy')
            : format(new Date(), 'MMMM dd, yyyy');

        // Build email HTML
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: right; padding-bottom: 20px;">
          <h2 style="color: #333; margin: 0;">AI Finance Assistant</h2>
          <p style="color: #666; margin: 0;">Blockchain-Powered Invoicing</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; color: #333;">PAYMENT CONFIRMATION</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f0f8f0; border-radius: 5px; margin-bottom: 30px;">
          <p style="font-size: 16px; margin: 0;">
            Thank you for your payment! We've received your payment for Invoice #${invoice.number}.
          </p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 18px; margin-bottom: 15px;">Payment Details</h2>
          
          <table style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Invoice Number:</td>
              <td style="padding: 8px 0;">${invoice.number}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount Paid:</td>
              <td style="padding: 8px 0;">${invoice.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Payment Date:</td>
              <td style="padding: 8px 0;">${paymentDate}</td>
            </tr>
            ${invoice.transactionHash ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Transaction Hash:</td>
                <td style="padding: 8px 0; word-break: break-all;">${invoice.transactionHash}</td>
              </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automatically generated email. Please do not reply to this email.</p>
          <p>Generated by AI Finance Assistant on ${format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </div>
    `;

        // Send the email
        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: invoice.clientEmail,
            subject: `Payment Confirmation for Invoice #${invoice.number}`,
            html: emailHtml,
        });

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send email'
        };
    }
}