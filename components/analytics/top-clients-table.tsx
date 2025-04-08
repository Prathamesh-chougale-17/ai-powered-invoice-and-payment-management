'use client';

import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

interface Client {
    clientName: string;
    clientEmail: string;
    totalRevenue: number;
    invoiceCount: number;
    lastInvoiceDate: Date;
}

interface TopClientsTableProps {
    clients: Client[];
}

export function TopClientsTable({ clients }: TopClientsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px]">Client</TableHead>
                        <TableHead className="text-right">Invoices</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Last Invoice</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clients.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No clients found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        clients.map((client) => (
                            <TableRow key={client.clientEmail}>
                                <TableCell className="font-medium">
                                    <div>
                                        <p className="font-medium">{client.clientName}</p>
                                        <p className="text-sm text-muted-foreground">{client.clientEmail}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">{client.invoiceCount}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(client.totalRevenue)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {format(new Date(client.lastInvoiceDate), 'MMM d, yyyy')}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}