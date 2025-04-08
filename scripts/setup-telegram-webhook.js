/**
 * This script sets up the Telegram webhook for your bot
 * 
 * Usage:
 * node scripts/setup-telegram-webhook.js <YOUR_BOT_TOKEN> <YOUR_WEBHOOK_URL>
 * 
 * Example:
 * node scripts/setup-telegram-webhook.js 123456789:AAAA-abcdefghijklmnopqrstuvwxyz https://your-domain.com/api/webhooks/telegram
 */

const https = require('https');

// Get the bot token and webhook URL from command line arguments
const botToken = process.argv[2];
const webhookUrl = process.argv[3];

if (!botToken || !webhookUrl) {
    console.error('\x1b[31mError: Missing required arguments\x1b[0m');
    console.log('\nUsage: node scripts/setup-telegram-webhook.js <BOT_TOKEN> <WEBHOOK_URL>');
    console.log('\nExample:');
    console.log('node scripts/setup-telegram-webhook.js 123456789:AAAA-abcdefghijklmnopqrstuvwxyz https://your-domain.com/api/webhooks/telegram');
    process.exit(1);
}

// Validate webhook URL
try {
    new URL(webhookUrl);
} catch (err) {
    console.error('\x1b[31mError: Invalid webhook URL\x1b[0m');
    process.exit(1);
}

// Validate that webhook URL is HTTPS (Telegram requirement)
if (!webhookUrl.startsWith('https://')) {
    console.error('\x1b[31mError: Webhook URL must use HTTPS\x1b[0m');
    console.log('\nTelegram only accepts webhook URLs with HTTPS.');
    console.log('If you\'re testing locally, consider using a service like ngrok to create a temporary HTTPS URL.');
    process.exit(1);
}

// Set up the Telegram webhook
console.log('\x1b[36m[1/4] Setting up Telegram webhook...\x1b[0m');

const telegramApiUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

https.get(telegramApiUrl, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);

            if (response.ok) {
                console.log('\x1b[32m[2/4] Webhook setup successful!\x1b[0m');
                console.log(`\nDescription: ${response.description}`);

                // Get webhook info to verify
                getWebhookInfo(botToken);
            } else {
                console.error(`\x1b[31m[2/4] Webhook setup failed: ${response.description}\x1b[0m`);
                process.exit(1);
            }
        } catch (err) {
            console.error('\x1b[31m[2/4] Error parsing response\x1b[0m', err);
            process.exit(1);
        }
    });
}).on('error', (err) => {
    console.error('\x1b[31m[2/4] Error setting up webhook\x1b[0m', err);
    process.exit(1);
});

// Get webhook info
function getWebhookInfo(botToken) {
    console.log('\x1b[36m[3/4] Verifying webhook info...\x1b[0m');

    const webhookInfoUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;

    https.get(webhookInfoUrl, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const response = JSON.parse(data);

                if (response.ok) {
                    console.log('\x1b[32m[4/4] Webhook verification successful!\x1b[0m');
                    console.log('\nWebhook Info:');
                    console.log(`URL: ${response.result.url}`);
                    console.log(`Has Custom Certificate: ${response.result.has_custom_certificate}`);
                    console.log(`Pending Update Count: ${response.result.pending_update_count}`);

                    if (response.result.last_error_date) {
                        const errorDate = new Date(response.result.last_error_date * 1000);
                        console.log(`\nLast Error Date: ${errorDate.toISOString()}`);
                        console.log(`Last Error Message: ${response.result.last_error_message}`);
                    }

                    console.log('\n\x1b[32mYour Telegram bot is now configured to receive webhooks at:\x1b[0m');
                    console.log(`\x1b[32m${webhookUrl}\x1b[0m`);

                    console.log('\n\x1b[33mDon\'t forget to update your environment variables:\x1b[0m');
                    console.log(`TELEGRAM_BOT_TOKEN=${botToken}`);

                    // Give instructions on how to get a chat ID
                    console.log('\n\x1b[33mTo get your Chat ID for notifications:\x1b[0m');
                    console.log('1. Start a conversation with your bot on Telegram');
                    console.log('2. Send the command /start to your bot');
                    console.log('3. The bot will respond with your Chat ID');
                    console.log('4. Add this Chat ID to your environment variables as TELEGRAM_CHAT_ID');
                } else {
                    console.error(`\x1b[31m[4/4] Webhook verification failed: ${response.description}\x1b[0m`);
                    process.exit(1);
                }
            } catch (err) {
                console.error('\x1b[31m[4/4] Error parsing webhook info\x1b[0m', err);
                process.exit(1);
            }
        });
    }).on('error', (err) => {
        console.error('\x1b[31m[4/4] Error getting webhook info\x1b[0m', err);
        process.exit(1);
    });
}