'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InvoiceStatus } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendInvoiceEmailAction } from '@/lib/actions/invoice-email-actions';

// Form schema for email sending
const emailFormSchema = z.object({
    senderName: z.string().min(1, 'Sender name is required'),
    senderEmail: z.string().email('Invalid email address'),
    attachPDF: z.boolean(),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

interface SendEmailButtonProps extends React.ComponentProps<typeof Button> {
    invoiceId: string;
    invoiceStatus: InvoiceStatus;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

export function SendEmailButton({
    invoiceId,
    invoiceStatus,
    variant = 'outline',
    size = 'default',
    className,
    ...props
}: SendEmailButtonProps) {
    const [open, setOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [emailType, setEmailType] = useState<'invoice' | 'payment'>('invoice');

    // Set up form
    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: {
            senderName: '',
            senderEmail: '',
            attachPDF: true,
        },
    });

    const onSubmit = async (data: EmailFormValues) => {
        try {
            setIsSending(true);
            setStatus('idle');
            setErrorMessage('');

            // Create form data for server action
            const formData = new FormData();
            formData.append('invoiceId', invoiceId);
            formData.append('senderName', data.senderName);
            formData.append('senderEmail', data.senderEmail);
            formData.append('emailType', emailType);
            formData.append('attachPDF', data.attachPDF.toString());

            // Call server action
            const result = await sendInvoiceEmailAction(formData);

            if (!result.success) {
                setStatus('error');
                setErrorMessage(result.error || 'Failed to send email');
                return;
            }

            setStatus('success');

            // Close the dialog after a delay
            setTimeout(() => {
                setOpen(false);
                form.reset();
            }, 2000);
        } catch (error) {
            console.error('Error sending email:', error);
            setStatus('error');
            setErrorMessage('An unexpected error occurred');
        } finally {
            setIsSending(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            form.reset();
            setStatus('idle');
            setErrorMessage('');
        } else {
            // Set email type based on invoice status
            setEmailType(invoiceStatus === InvoiceStatus.PAID ? 'payment' : 'invoice');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant={variant} size={size} className={className} {...props}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {emailType === 'invoice' ? 'Send Invoice Email' : 'Send Payment Confirmation'}
                    </DialogTitle>
                    <DialogDescription>
                        {emailType === 'invoice'
                            ? 'Send this invoice to your client via email.'
                            : 'Send a payment confirmation email to your client.'}
                    </DialogDescription>
                </DialogHeader>

                {status === 'success' && (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>Email sent successfully</AlertTitle>
                        <AlertDescription>
                            Your email has been sent to the client.
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'error' && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Failed to send email</AlertTitle>
                        <AlertDescription>
                            {errorMessage || 'There was an error sending your email. Please try again.'}
                        </AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="senderName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This will appear as the sender name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="senderEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This will be used as the reply-to address.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {emailType === 'invoice' && (
                            <FormField
                                control={form.control}
                                name="attachPDF"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Attach PDF</FormLabel>
                                            <FormDescription>
                                                Include a PDF version of the invoice as an attachment.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={isSending}>
                                {isSending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}