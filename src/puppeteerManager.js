const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const path = require("path");
const { sendTelegramMessage } = require("./utils");
const dotenv = require("dotenv");
dotenv.config();

puppeteer.use(StealthPlugin());

const extensionPath = path.resolve("./extension");
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const url = process.env.URL;

async function startBrowser(socket, browsers, stopRefreshing) {
  const browserId = browsers.length + 1;
  const userDataDir = path.join(__dirname, `user_data/browser_${browserId}`);
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
    userDataDir,
  });
  browser._browserId = browserId;
  browsers.push(browser);
  socket.emit("browserStarted", browserId);

  const page = await browser.newPage();
  checkPage(browser, socket, page, stopRefreshing);

  setInterval(async () => {
    try {
      const screenshot = await page.screenshot({ encoding: "base64" });
      socket.emit("browserScreenshot", { browserId, screenshot });
    } catch (error) {
      console.error(`Error taking screenshot for browser ${browserId}:`, error);
    }
  }, 100);
}

async function stopBrowser(browserId, browsers) {
  const browser = browsers.find((b) => b._browserId === browserId);
  if (browser) {
    await browser.close();
    browsers.splice(browsers.indexOf(browser), 1);
  }
}

async function checkPage(browser, socket, page, stopRefreshing) {
  try {
    const response = await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
    const status = response.status();
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const errorMessage = "تعذر الإتصال بالخادم حاليا ، يرجى المحاولة لاحقا";

    if (status === 200 && !bodyHTML.includes(errorMessage)) {
      const message = `Browser ${browser._browserId} - Status: ${status} - Stopped refreshing`;
      console.log(message);
      await sendTelegramMessage(message, TELEGRAM_TOKEN, CHAT_ID);
      socket.emit("browserMessage", {
        browserId: browser._browserId,
        message,
        type: "success",
      });
    } else {
      const refreshMessage = `Browser ${browser._browserId} - Status: ${status} - Refreshing`;
      console.log(refreshMessage);
      socket.emit("browserMessage", {
        browserId: browser._browserId,
        message: refreshMessage,
        type: "warning",
      });

      if (!stopRefreshing) {
        setTimeout(
          () => checkPage(browser, socket, page, stopRefreshing),
          5000
        );
      }
    }
  } catch (error) {
    console.error("Error checking page:", error.message);
    socket.emit("browserMessage", {
      browserId: browser._browserId,
      message: `Error: ${error.message}`,
      type: "danger",
    });

    if (!stopRefreshing) {
      setTimeout(() => checkPage(browser, socket, page, stopRefreshing), 5000);
    }
  }
}

module.exports = {
  startBrowser,
  stopBrowser,
  checkPage,
};
