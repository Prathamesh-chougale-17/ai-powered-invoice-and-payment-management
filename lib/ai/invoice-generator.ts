'use server';

import { z } from 'zod';
import { GoogleGenAI, FunctionDeclaration, FunctionCallingConfigMode, Type } from '@google/genai';
import { AIGeneratedInvoice } from '@/types';
import { addDays } from 'date-fns';

// 🔐 Your Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// ✅ Zod schema for invoice validation
const invoiceSchema = z.object({
    clientName: z.string(),
    clientEmail: z.string().email(),
    clientAddress: z.string().optional(),
    items: z.array(
        z.object({
            description: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
            amount: z.number(),
        })
    ),
    notes: z.string().optional(),
    terms: z.string().optional(),
    dueDate: z.string(), // e.g., "2025-05-10"
});

// type InvoiceSchema = z.infer<typeof invoiceSchema>;

// 👇 Function Declaration for Gemini
const invoiceFunction: FunctionDeclaration = {
    name: 'generate_invoice',
    description: 'Generates a detailed invoice in JSON format',
    parameters: {
        type: Type.OBJECT,
        properties: {
            clientName: { type: Type.STRING },
            clientEmail: { type: Type.STRING },
            clientAddress: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        unitPrice: { type: Type.NUMBER },
                        amount: { type: Type.NUMBER },
                    },
                    required: ['description', 'quantity', 'unitPrice', 'amount'],
                },
            },
            notes: { type: Type.STRING },
            terms: { type: Type.STRING },
            dueDate: { type: Type.STRING },
        },
        required: ['clientName', 'clientEmail', 'items', 'dueDate'],
    },
};

// 🔁 Main Invoice Function using Gemini + Zod
export async function generateAIInvoice(prompt: string): Promise<AIGeneratedInvoice> {
    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: prompt,
            config: {
                toolConfig: {
                    functionCallingConfig: {
                        mode: FunctionCallingConfigMode.ANY,
                        allowedFunctionNames: ['generate_invoice'],
                    },
                },
                tools: [{ functionDeclarations: [invoiceFunction] }],
            },
        });

        const rawArgs = result.functionCalls?.[0]?.args;
        if (!rawArgs) throw new Error('No function call response from Gemini.');

        const parsed = invoiceSchema.parse(rawArgs);

        const processedInvoice: AIGeneratedInvoice = {
            clientName: parsed.clientName,
            clientEmail: parsed.clientEmail,
            clientAddress: parsed.clientAddress,
            items: parsed.items.map((item) => ({
                id: generateRandomId(),
                ...item,
            })),
            notes: parsed.notes,
            terms: parsed.terms,
            dueDate: new Date(parsed.dueDate),
        };

        return processedInvoice;
    } catch (error) {
        console.error('Error generating invoice with Gemini:', error);

        return {
            clientName: 'Gemini Generated Client',
            clientEmail: 'client@example.com',
            items: [
                {
                    id: generateRandomId(),
                    description: 'Service as described in prompt',
                    quantity: 1,
                    unitPrice: 100,
                    amount: 100,
                },
            ],
            dueDate: addDays(new Date(), 30),
        };
    }
}

// 🔢 Helper: Generate random ID
function generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15);
}
