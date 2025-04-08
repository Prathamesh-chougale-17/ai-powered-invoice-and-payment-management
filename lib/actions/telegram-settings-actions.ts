'use server';

import { z } from 'zod';
import { setupTelegramWebhook } from '@/lib/services/telegram-service';
import { revalidatePath } from 'next/cache';

// Schema for telegram settings
const TelegramSettingsSchema = z.object({
    telegramBotToken: z.string().min(1, 'Bot token is required'),
    telegramChatId: z.string().min(1, 'Chat ID is required'),
    telegramWebhookUrl: z.string().url('Webhook URL must be a valid URL'),
});

/**
 * Save telegram notification settings
 */
export async function saveTelegramSettings(formData: FormData): Promise<{
    success: boolean;
    error?: string;
    errors?: Record<string, string>;
}> {
    try {
        // Parse form data
        const rawData = {
            telegramBotToken: formData.get('telegramBotToken') as string,
            telegramChatId: formData.get('telegramChatId') as string,
            telegramWebhookUrl: formData.get('telegramWebhookUrl') as string,
        };

        // Validate data
        const validationResult = TelegramSettingsSchema.safeParse(rawData);

        if (!validationResult.success) {
            return {
                success: false,
                errors: validationResult.error.errors.reduce((acc, error) => {
                    acc[error.path.join('.')] = error.message;
                    return acc;
                }, {} as Record<string, string>),
            };
        }

        const validatedData = validationResult.data;

        // In a real app, save these settings to database or environment variables
        // For this example, we'll just set up the webhook

        // Set up webhook
        if (validatedData.telegramWebhookUrl) {
            const webhookResult = await setupTelegramWebhook(validatedData.telegramWebhookUrl);

            if (!webhookResult) {
                return {
                    success: false,
                    error: 'Failed to set up Telegram webhook',
                };
            }
        }

        // For a real app, you'd save these settings to environment variables or database
        // Example (pseudocode):
        // await saveEnvVariables({
        //   TELEGRAM_BOT_TOKEN: validatedData.telegramBotToken,
        //   TELEGRAM_CHAT_ID: validatedData.telegramChatId,
        // });

        revalidatePath('/dashboard/settings');

        return {
            success: true,
        };
    } catch (error) {
        console.error('Error saving Telegram settings:', error);
        return {
            success: false,
            error: 'Failed to save Telegram settings',
        };
    }
}

/**
 * Test Telegram connection
 */
export async function testTelegramConnection(formData: FormData): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        // Parse form data
        const rawData = {
            telegramBotToken: formData.get('telegramBotToken') as string,
            telegramChatId: formData.get('telegramChatId') as string,
        };

        if (!rawData.telegramBotToken || !rawData.telegramChatId) {
            return {
                success: false,
                error: 'Both Bot Token and Chat ID are required',
            };
        }

        // In a real app, you'd use these values to test the connection
        // For this example, we'll just pretend it worked

        // Example: Send a test message
        // const bot = new TelegramBot(rawData.telegramBotToken, { polling: false });
        // await bot.sendMessage(rawData.telegramChatId, '✅ Test message from AI Finance Assistant');

        return {
            success: true,
        };
    } catch (error) {
        console.error('Error testing Telegram connection:', error);
        return {
            success: false,
            error: 'Failed to connect to Telegram: ' + (error instanceof Error ? error.message : String(error)),
        };
    }
}