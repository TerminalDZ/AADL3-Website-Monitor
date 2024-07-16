const axios = require('axios');
const path = require('path');

async function sendTelegramMessage(message, TELEGRAM_TOKEN, CHAT_ID) {
    if (!TELEGRAM_TOKEN || !CHAT_ID) {
        console.error('Telegram token or chat ID is not set');
        return;
    }
    
    try {
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message
        });
    } catch (error) {
      //  console.error('Failed to send message to Telegram:', error);
      console.error('Failed to send message to Telegram');
    }
}

async function takeScreenshot(page, browserId) {
    const screenshotPath = path.join(__dirname, 'public', 'screenshots', `browser-${browserId}.png`);
    try {
        await page.screenshot({ path: screenshotPath });
        return `/screenshots/browser-${browserId}.png`;
    } catch (error) {
        //console.error(`Failed to take screenshot for browser ${browserId}:`, error);
        console.error(`Failed to take screenshot for browser ${browserId}:`);
        return null;
    }
}

module.exports = {
    sendTelegramMessage,
    takeScreenshot
};
