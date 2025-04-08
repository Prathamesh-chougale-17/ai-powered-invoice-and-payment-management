// Invoice Types
export interface Invoice {
    id: string;
    number: string;
    createdAt: Date;
    dueDate: Date;
    clientName: string;
    clientEmail: string;
    clientAddress?: string;
    items: InvoiceItem[];
    notes?: string;
    terms?: string;
    status: InvoiceStatus;
    totalAmount: number;
    userId: string;
    walletAddress?: string;
    paymentAddress?: string;
    paymentTokenType?: string;
    paidAt?: Date;
    transactionHash?: string;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export enum InvoiceStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    PAID = 'paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled'
}

// Transaction Types
export interface Transaction {
    id: string;
    createdAt: Date;
    amount: number;
    tokenType: string;
    fromAddress: string;
    toAddress: string;
    status: TransactionStatus;
    hash: string;
    blockNumber?: number;
    invoiceId?: string;
    description?: string;
    userId: string;
    networkId: number;
}

export enum TransactionStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    FAILED = 'failed'
}

// User Types
export interface User {
    id: string;
    name: string;
    email: string;
    walletAddresses: WalletAddress[];
}

export interface WalletAddress {
    address: string;
    chainId: number;
    isPrimary: boolean;
}

// AI Generation Types
export interface AIInvoicePrompt {
    clientName?: string;
    services?: string[];
    description?: string;
    amount?: number;
}

export interface AIGeneratedInvoice {
    clientName: string;
    clientEmail: string;
    clientAddress?: string;
    items: InvoiceItem[];
    notes?: string;
    terms?: string;
    dueDate: Date;
}