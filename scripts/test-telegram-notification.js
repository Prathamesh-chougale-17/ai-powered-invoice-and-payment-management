/**
 * This script tests the Telegram bot by sending a test notification
 * 
 * Usage:
 * node scripts/test-telegram-notification.js <YOUR_BOT_TOKEN> <CHAT_ID>
 * 
 * Example:
 * node scripts/test-telegram-notification.js 123456789:AAAA-abcdefghijklmnopqrstuvwxyz 123456789
 */

const https = require('https');

// Get the bot token and chat ID from command line arguments
const botToken = process.argv[2];
const chatId = process.argv[3];

if (!botToken || !chatId) {
    console.error('\x1b[31mError: Missing required arguments\x1b[0m');
    console.log('\nUsage: node scripts/test-telegram-notification.js <BOT_TOKEN> <CHAT_ID>');
    console.log('\nExample:');
    console.log('node scripts/test-telegram-notification.js 123456789:AAAA-abcdefghijklmnopqrstuvwxyz 123456789');
    process.exit(1);
}

// Create test message
const testMessage = `🧪 *Test Notification*\n\n` +
    `This is a test notification from the AI Finance Assistant.\n\n` +
    `If you are receiving this message, your Telegram bot is working correctly! 🎉\n\n` +
    `*Bot Token:* ${botToken.substring(0, 6)}...${botToken.substring(botToken.length - 6)}\n` +
    `*Chat ID:* ${chatId}\n` +
    `*Time:* ${new Date().toISOString()}\n\n` +
    `You can now use this bot to receive notifications about invoices, payments, and transactions.`;

// Send the test message
console.log('\x1b[36m[1/2] Sending test notification...\x1b[0m');

const params = new URLSearchParams({
    chat_id: chatId,
    text: testMessage,
    parse_mode: 'Markdown',
});

const options = {
    hostname: 'api.telegram.org',
    path: `/bot${botToken}/sendMessage?${params.toString()}`,
    method: 'GET',
};

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const response = JSON.parse(data);

            if (response.ok) {
                console.log('\x1b[32m[2/2] Test notification sent successfully!\x1b[0m');
                console.log('\nCheck your Telegram to confirm you received the message.');
                console.log('\n\x1b[33mEnvironment variables to set:\x1b[0m');
                console.log(`TELEGRAM_BOT_TOKEN=${botToken}`);
                console.log(`TELEGRAM_CHAT_ID=${chatId}`);
            } else {
                console.error(`\x1b[31m[2/2] Failed to send test notification: ${response.description}\x1b[0m`);

                if (response.description.includes("bot can't initiate conversation")) {
                    console.log('\n\x1b[33mTip: Your bot cannot initiate a conversation.\x1b[0m');
                    console.log('Make sure you have started a conversation with the bot by sending it a /start command in Telegram.');
                } else if (response.description.includes("chat not found")) {
                    console.log('\n\x1b[33mTip: The chat ID may be incorrect.\x1b[0m');
                    console.log('Make sure you have the correct chat ID. Send /start to your bot in Telegram to get your chat ID.');
                }

                process.exit(1);
            }
        } catch (err) {
            console.error('\x1b[31m[2/2] Error parsing response\x1b[0m', err);
            process.exit(1);
        }
    });
});

req.on('error', (err) => {
    console.error('\x1b[31m[2/2] Error sending test notification\x1b[0m', err);
    process.exit(1);
});

req.end();