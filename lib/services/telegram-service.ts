'use server';

import TelegramBot from 'node-telegram-bot-api';
import { Invoice, InvoiceStatus, Transaction, TransactionStatus } from '@/types';
import { formatCurrency, truncateAddress } from '@/lib/utils';

// Initialize Telegram bot (use polling: false for webhook mode)
const bot = process.env.TELEGRAM_BOT_TOKEN
    ? new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })
    : null;

// Chat ID where notifications will be sent
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

/**
 * Send a notification about new invoice creation
 */
export async function sendInvoiceCreationNotification(invoice: Invoice): Promise<boolean> {
    try {
        if (!bot || !CHAT_ID) {
            console.warn('Telegram bot token or chat ID not configured');
            return false;
        }

        const message = `🧾 *New Invoice Created*\n\n` +
            `*Invoice:* ${invoice.number}\n` +
            `*Client:* ${invoice.clientName}\n` +
            `*Amount:* ${formatCurrency(invoice.totalAmount)}\n` +
            `*Due Date:* ${new Date(invoice.dueDate).toLocaleDateString()}\n` +
            `*Status:* ${invoice.status.toUpperCase()}`;

        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });

        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
}

/**
 * Send a notification about invoice payment
 */
export async function sendInvoicePaymentNotification(invoice: Invoice): Promise<boolean> {
    try {
        if (!bot || !CHAT_ID) {
            console.warn('Telegram bot token or chat ID not configured');
            return false;
        }

        const message = `💰 *Invoice Paid*\n\n` +
            `*Invoice:* ${invoice.number}\n` +
            `*Client:* ${invoice.clientName}\n` +
            `*Amount:* ${formatCurrency(invoice.totalAmount)}\n` +
            `*Paid on:* ${invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'Unknown'}\n` +
            (invoice.transactionHash ? `*Transaction:* ${truncateAddress(invoice.transactionHash)}\n` : '');

        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });

        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
}

/**
 * Send a notification about a new transaction
 */
export async function sendTransactionNotification(transaction: Transaction): Promise<boolean> {
    try {
        if (!bot || !CHAT_ID) {
            console.warn('Telegram bot token or chat ID not configured');
            return false;
        }

        const message = `💸 *New Transaction*\n\n` +
            `*Amount:* ${transaction.amount} ${transaction.tokenType}\n` +
            `*From:* ${truncateAddress(transaction.fromAddress)}\n` +
            `*To:* ${truncateAddress(transaction.toAddress)}\n` +
            `*Network:* ${getChainName(transaction.networkId)}\n` +
            `*Status:* ${transaction.status.toUpperCase()}\n` +
            (transaction.description ? `*Description:* ${transaction.description}\n` : '');

        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });

        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
}

/**
 * Send a notification about an overdue invoice
 */
export async function sendOverdueInvoiceNotification(invoice: Invoice): Promise<boolean> {
    try {
        if (!bot || !CHAT_ID) {
            console.warn('Telegram bot token or chat ID not configured');
            return false;
        }

        const message = `⚠️ *Invoice Overdue*\n\n` +
            `*Invoice:* ${invoice.number}\n` +
            `*Client:* ${invoice.clientName}\n` +
            `*Amount:* ${formatCurrency(invoice.totalAmount)}\n` +
            `*Due Date:* ${new Date(invoice.dueDate).toLocaleDateString()}\n` +
            `*Days Overdue:* ${Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))}`;

        await bot.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });

        return true;
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
        return false;
    }
}

/**
 * Setup webhook for Telegram bot
 * This function should be called during app initialization or from an admin endpoint
 */
export async function setupTelegramWebhook(webhookUrl: string): Promise<boolean> {
    try {
        if (!bot) {
            console.warn('Telegram bot token not configured');
            return false;
        }

        // Set webhook URL
        await bot.setWebHook(webhookUrl);

        // Get webhook info to verify
        const webhookInfo = await bot.getWebHookInfo();

        if (webhookInfo.url !== webhookUrl) {
            throw new Error('Failed to set webhook URL');
        }

        return true;
    } catch (error) {
        console.error('Error setting up Telegram webhook:', error);
        return false;
    }
}

/**
 * Process incoming webhook update from Telegram
 * This function should be called from a webhook API route
 */
export async function processTelegramUpdate(update: TelegramBot.Update): Promise<boolean> {
    try {
        if (!bot) {
            console.warn('Telegram bot token not configured');
            return false;
        }

        // Process message
        if (update.message) {
            const chatId = update.message.chat.id;
            const text = update.message.text || '';

            // Handle /start command
            if (text.startsWith('/start')) {
                await bot.sendMessage(
                    chatId,
                    `👋 Welcome to AI Finance Assistant!\n\nYour Chat ID is: \`${chatId}\`\n\nPlease add this Chat ID to your settings to receive notifications.`,
                    { parse_mode: 'Markdown' }
                );
                return true;
            }

            // Handle /help command
            if (text.startsWith('/help')) {
                await bot.sendMessage(
                    chatId,
                    `*Available Commands:*\n\n` +
                    `/start - Get your Chat ID\n` +
                    `/help - Show this help message\n` +
                    `/status - Check if notifications are enabled`,
                    { parse_mode: 'Markdown' }
                );
                return true;
            }

            // Handle /status command
            if (text.startsWith('/status')) {
                const isEnabled = chatId.toString() === CHAT_ID;
                await bot.sendMessage(
                    chatId,
                    isEnabled
                        ? '✅ Notifications are enabled for this chat'
                        : '❌ Notifications are not enabled for this chat',
                    { parse_mode: 'Markdown' }
                );
                return true;
            }

            // Default response for other messages
            await bot.sendMessage(
                chatId,
                'I can send you notifications about invoices and transactions. Type /help to see available commands.'
            );
            return true;
        }

        return true;
    } catch (error) {
        console.error('Error processing Telegram update:', error);
        return false;
    }
}

/**
 * Create API route handler for Telegram webhook
 * This function should be exported from a webhook API route
 */
export async function telegramWebhookHandler(req: Request): Promise<Response> {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const update = await req.json() as TelegramBot.Update;
        await processTelegramUpdate(update);
        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Error handling Telegram webhook:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

/**
 * Helper function to get chain name from chain ID
 */
function getChainName(chainId: number): string {
    const chains: Record<number, string> = {
        1: 'Ethereum',
        137: 'Polygon',
        10: 'Optimism',
        42161: 'Arbitrum',
        8453: 'Base',
        56: 'BNB Chain',
        43114: 'Avalanche',
        324: 'zkSync Era',
        100: 'Gnosis Chain',
        1101: 'Polygon zkEVM',
        314: 'Filecoin',
        42220: 'Celo',
        11155111: 'Sepolia',
        534351: 'Scroll Sepolia',
    };

    return chains[chainId] || `Chain ID ${chainId}`;
}