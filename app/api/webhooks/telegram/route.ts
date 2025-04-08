import { telegramWebhookHandler } from '@/lib/services/telegram-service';

export async function POST(request: Request) {
    return telegramWebhookHandler(request);
}

export async function GET() {
    return new Response('AI Finance Assistant Telegram Webhook', { status: 200 });
}