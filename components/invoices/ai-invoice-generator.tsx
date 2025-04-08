'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateAIInvoiceAction } from '@/lib/actions/invoice-actions';
import { AIGeneratedInvoice } from '@/types';

const formSchema = z.object({
    prompt: z.string().min(5, 'Prompt must be at least 5 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface AIInvoiceGeneratorProps {
    onInvoiceGenerated: (invoice: AIGeneratedInvoice) => void;
}

export function AIInvoiceGenerator({ onInvoiceGenerated }: AIInvoiceGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: '',
        },
    });

    async function onSubmit(data: FormValues) {
        try {
            setIsGenerating(true);

            const result = await generateAIInvoiceAction(data.prompt);

            if (result.success && result.invoice) {
                onInvoiceGenerated(result.invoice);
                form.reset();
            } else {
                // Handle error
                console.error('Failed to generate invoice with AI');
            }
        } catch (error) {
            console.error('Error generating invoice:', error);
        } finally {
            setIsGenerating(false);
        }
    }

    const examplePrompts = [
        "Create an invoice for a web development project for client ABC Corp, with 20 hours of work at $100/hr",
        "Generate an invoice for logo design and branding package for $1,500",
        "Make an invoice for monthly consulting services, 3 sessions at $200 each",
    ];

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Invoice Generator
                </CardTitle>
                <CardDescription>
                    Describe what you want to invoice and our AI will generate it for you.
                </CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Describe the work done, client, amount, etc. The more details you provide, the better the result."
                        className="min-h-32 resize-none"
                        {...form.register('prompt')}
                        disabled={isGenerating}
                    />
                    {form.formState.errors.prompt && (
                        <p className="text-sm text-red-500">{form.formState.errors.prompt.message}</p>
                    )}

                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Example prompts:</p>
                        <div className="flex flex-wrap gap-2">
                            {examplePrompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => form.setValue('prompt', prompt)}
                                    disabled={isGenerating}
                                    className="text-xs"
                                >
                                    {prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button
                        type="submit"
                        variant="ghost"
                        disabled={isGenerating}
                        className="flex items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" /> : 'Generate Invoice'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}