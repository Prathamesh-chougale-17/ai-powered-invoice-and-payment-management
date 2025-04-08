'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateInvoicePDFAction } from '@/lib/actions/invoice-pdf-actions';

interface DownloadPDFButtonProps extends React.ComponentProps<typeof Button> {
    invoiceId: string;
}

export function DownloadPDFButton({
    invoiceId,
    className,
    variant = 'outline',
    size = 'default',
    ...props
}: DownloadPDFButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);

            // Request the PDF as base64
            const result = await generateInvoicePDFAction(invoiceId);

            if (!result.success || !result.pdfBase64 || !result.filename) {
                throw new Error(result.error || 'Failed to generate PDF');
            }

            // Convert base64 to blob
            const binaryString = window.atob(result.pdfBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', result.filename);

            // Append the link to the document
            document.body.appendChild(link);

            // Click the link
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF. Please try again later.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleDownload}
            disabled={isDownloading}
            {...props}
        >
            {isDownloading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                </>
            ) : (
                <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download PDF
                </>
            )}
        </Button>
    );
}