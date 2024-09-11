const axios = require("axios");
const path = require("path");

async function sendTelegramMessage(message, TELEGRAM_TOKEN, CHAT_ID) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    console.error("Telegram token or chat ID is not set");
    return;
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
      }
    );
  } catch (error) {
    console.error("Failed to send message to Telegram");
  }
}

module.exports = {
  sendTelegramMessage,
};
