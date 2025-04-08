import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { Invoice, InvoiceItem } from '@/types';

/**
 * Generates a PDF buffer for an invoice
 */
export async function generateInvoicePDF(invoice: Invoice): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({ margin: 50 });

            // Buffer to store the PDF data
            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Add the invoice header
            addHeader(doc, invoice);

            // Add client and invoice details
            addInvoiceDetails(doc, invoice);

            // Add invoice items
            addInvoiceItems(doc, invoice.items);

            // Add total amount
            addTotal(doc, invoice.totalAmount);

            // Add notes and terms
            addNotesAndTerms(doc, invoice);

            // Add footer
            addFooter(doc, invoice);

            // Finalize the PDF
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Add header section to PDF
 */
function addHeader(doc: PDFKit.PDFDocument, invoice: Invoice) {
    // Company logo and name
    doc.fontSize(20).text('AI Finance Assistant', { align: 'right' });
    doc.fontSize(10).text('Blockchain-Powered Invoicing', { align: 'right' });
    doc.moveDown();

    // Add invoice title
    doc.fontSize(28).text('INVOICE', { align: 'center' });
    doc.moveDown();
}

/**
 * Add invoice and client details
 */
function addInvoiceDetails(doc: PDFKit.PDFDocument, invoice: Invoice) {
    doc.fontSize(10);

    // Client information
    doc.font('Helvetica-Bold').text('Bill To:');
    doc.font('Helvetica').text(invoice.clientName);
    doc.text(invoice.clientEmail);

    if (invoice.clientAddress) {
        doc.text(invoice.clientAddress);
    }

    doc.moveDown();

    // Invoice information
    const invoiceInfo = [
        { label: 'Invoice Number:', value: invoice.number },
        { label: 'Invoice Date:', value: format(new Date(invoice.createdAt), 'MMMM dd, yyyy') },
        { label: 'Due Date:', value: format(new Date(invoice.dueDate), 'MMMM dd, yyyy') },
        { label: 'Status:', value: invoice.status.toUpperCase() },
    ];

    // Position for the invoice details
    const invoiceInfoX = 400;

    invoiceInfo.forEach((item, i) => {
        doc.font('Helvetica-Bold').text(item.label, invoiceInfoX, 120 + (i * 15));
        doc.font('Helvetica').text(item.value, invoiceInfoX + 90, 120 + (i * 15));
    });

    doc.moveDown(4);
}

/**
 * Add invoice items table
 */
function addInvoiceItems(doc: PDFKit.PDFDocument, items: InvoiceItem[]) {
    // Table header
    const tableTop = 220;
    const itemX = 50;
    const descriptionX = 100;
    const quantityX = 350;
    const priceX = 400;
    const amountX = 470;

    doc.font('Helvetica-Bold');
    doc.text('Item', itemX, tableTop);
    doc.text('Description', descriptionX, tableTop);
    doc.text('Quantity', quantityX, tableTop);
    doc.text('Price', priceX, tableTop);
    doc.text('Amount', amountX, tableTop);

    doc.moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

    doc.font('Helvetica');

    // Table rows
    let y = tableTop + 25;
    items.forEach((item, i) => {
        doc.text((i + 1).toString(), itemX, y);
        doc.text(item.description, descriptionX, y, { width: 240 });
        doc.text(item.quantity.toString(), quantityX, y);
        doc.text(`$${item.unitPrice.toFixed(2)}`, priceX, y);
        doc.text(`$${item.amount.toFixed(2)}`, amountX, y);

        y += 25;

        // Add a page if we're running out of space
        if (y > 700) {
            doc.addPage();
            y = 50;
        }
    });

    doc.moveTo(50, y)
        .lineTo(550, y)
        .stroke();

    doc.moveDown(2);
}

/**
 * Add total amount section
 */
function addTotal(doc: PDFKit.PDFDocument, totalAmount: number) {
    const totalY = doc.y + 10;

    doc.font('Helvetica-Bold').text('Total:', 400, totalY);
    doc.font('Helvetica-Bold').text(`$${totalAmount.toFixed(2)}`, 470, totalY);

    doc.moveDown(2);
}

/**
 * Add notes and terms
 */
function addNotesAndTerms(doc: PDFKit.PDFDocument, invoice: Invoice) {
    if (invoice.notes) {
        doc.font('Helvetica-Bold').text('Notes:');
        doc.font('Helvetica').text(invoice.notes);
        doc.moveDown();
    }

    if (invoice.terms) {
        doc.font('Helvetica-Bold').text('Terms and Conditions:');
        doc.font('Helvetica').text(invoice.terms);
        doc.moveDown();
    }

    // Add payment instructions if available
    if (invoice.paymentAddress) {
        doc.font('Helvetica-Bold').text('Payment Information:');
        doc.font('Helvetica').text(`Payment Address: ${invoice.paymentAddress}`);

        if (invoice.paymentTokenType) {
            doc.text(`Token: ${invoice.paymentTokenType}`);
        }

        doc.moveDown();
    }
}

/**
 * Add footer with pagination
 */
function addFooter(doc: PDFKit.PDFDocument, invoice: Invoice) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        // Footer text
        doc.fontSize(8)
            .text(
                `Generated by AI Finance Assistant | ${format(new Date(), 'MMMM dd, yyyy')}`,
                50,
                doc.page.height - 50,
                { align: 'center', width: doc.page.width - 100 }
            );

        // Page number
        doc.text(
            `Page ${i + 1} of ${pageCount}`,
            50,
            doc.page.height - 35,
            { align: 'center', width: doc.page.width - 100 }
        );
    }
}