'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { AIInvoiceGenerator } from '@/components/invoices/ai-invoice-generator';
import { InvoiceForm } from '@/components/invoices/invoice-form';
import { Button } from '@/components/ui/button';
import { AIGeneratedInvoice } from '@/types';

export default function NewInvoicePage() {
    const [activeTab, setActiveTab] = useState<string>('manual');
    const [aiGeneratedInvoice, setAiGeneratedInvoice] = useState<AIGeneratedInvoice | null>(null);

    const handleInvoiceGenerated = (invoice: AIGeneratedInvoice) => {
        setAiGeneratedInvoice(invoice);
        setActiveTab('manual');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <DashboardHeader
                    title="Create Invoice"
                    description="Create a new invoice manually or with AI assistance."
                />
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/invoices">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Invoices
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                    <TabsTrigger value="ai">AI Generator</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="space-y-4">
                    <InvoiceForm aiGeneratedInvoice={aiGeneratedInvoice || undefined} />
                </TabsContent>
                <TabsContent value="ai" className="space-y-4">
                    <AIInvoiceGenerator onInvoiceGenerated={handleInvoiceGenerated} />
                </TabsContent>
            </Tabs>
        </div>
    );
}