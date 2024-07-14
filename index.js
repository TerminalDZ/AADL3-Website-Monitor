const puppeteer = require('puppeteer-extra');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs').promises;

puppeteer.use(StealthPlugin());

const extensionPath = path.resolve('./extension');
const TELEGRAM_TOKEN = 'TELEGRAM_TOKEN';
const CHAT_ID = 'CHAT_ID';
const url = 'https://aadl3inscription2024.dz/AR/Inscription-desktop.php';

let stopRefreshing = false;
const browsers = [];

async function sendTelegramMessage(message) {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    });
    console.log(response.data);
  } catch (error) {
    console.error('Failed to send message to Telegram:', error);
  }
}

async function takeScreenshot(page, browserId) {
  const screenshotPath = path.join(__dirname, 'public', 'screenshots', `browser-${browserId}.png`);
  try {
    await page.screenshot({ path: screenshotPath });
    return `/screenshots/browser-${browserId}.png`;
  } catch (error) {
    console.error(`Failed to take screenshot for browser ${browserId}:`, error);
    return null;
  }
}

async function takeAllScreenshots(browser, socket) {
  const pages = await browser.pages();
  for (let i = 1; i < pages.length; i++) {
    const screenshotPath = await takeScreenshot(pages[i], browser._browserId);
    if (screenshotPath) {
      socket.emit('screenshotTaken', { browserId: browser._browserId, screenshotPath });
    }
  }
}

async function getDataInfo() {
  try {
    const data = await fs.readFile('info.txt', 'utf8');
    const records = data.split('......................');

    const jsonData = records.map(record => {
      const lines = record.trim().split('\n');
      const entry = {};

      lines.forEach(line => {
        const [key, value] = line.split(':').map(item => item.trim());
        entry[key] = value;
      });

      return entry;
    }).filter(entry => Object.keys(entry).length > 0);

    return jsonData;
  } catch (error) {
    console.error('Error reading from file', error);
    return [];
  }
}

async function addDataToFile(NOM, WIL, NIN, NSS, TEL) {
  try {
    let data = await fs.readFile('info.txt', 'utf8');
    data += `\n......................\n
    NOM: ${NOM}\n
    WIL: ${WIL}\n
    NIN: ${NIN}\n
    NSS: ${NSS}\n
    TEL: ${TEL}`;

    await fs.writeFile('info.txt', data, 'utf8');
  } catch (error) {
    console.error('Error writing to file', error);
  }
}

async function deleteDataFromFile(NIN) {
  try {
    let data = await fs.readFile('info.txt', 'utf8');
    const regex = new RegExp(`\\n......................\\n\\s*NOM:.*?\\n\\s*WIL:.*?\\n\\s*NIN: ${NIN}.*?\\n\\s*NSS:.*?\\n\\s*TEL:.*?(?=\\n......................|$)`, 'gs');

    data = data.replace(regex, '');

    await fs.writeFile('info.txt', data, 'utf8');
    console.log(`Data with NIN: ${NIN} has been deleted.`);
  } catch (error) {
    console.error('Error writing to file', error);
  }
}

async function checkPage(browser, socket, page) {
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const status = response.status();
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    const errorMessage = 'تعذر الإتصال بالخادم حاليا ، يرجى المحاولة لاحقا';

    if (status === 200 && !bodyHTML.includes(errorMessage)) {
      const message = `Browser ${browser._browserId} - Status: ${status} - Stopped refreshing`;
      console.log(message);
      await sendTelegramMessage(message);
      socket.emit('browserMessage', { browserId: browser._browserId, message, type: 'success' });

      const screenshotPath = await takeScreenshot(page, browser._browserId);
      if (screenshotPath) {
        socket.emit('screenshotTaken', { browserId: browser._browserId, screenshotPath });
      }
    } else {
      const refreshMessage = `Browser ${browser._browserId} - Status: ${status} - Refreshing`;
      console.log(refreshMessage);
      socket.emit('browserMessage', { browserId: browser._browserId, message: refreshMessage, type: 'warning' });

      const screenshotPath = await takeScreenshot(page, browser._browserId);
      if (screenshotPath) {
        socket.emit('screenshotTaken', { browserId: browser._browserId, screenshotPath });
      }

      if (!stopRefreshing) {
        setTimeout(() => checkPage(browser, socket, page), 5000);
      }
    }
  } catch (error) {
    console.error('Error checking page:', error);
    socket.emit('browserMessage', { browserId: browser._browserId, message: `Error: ${error.message}`, type: 'danger' });

    const screenshotPath = await takeScreenshot(page, browser._browserId);
    if (screenshotPath) {
      socket.emit('screenshotTaken', { browserId: browser._browserId, screenshotPath });
    }

    if (!stopRefreshing) {
      setTimeout(() => checkPage(browser, socket, page), 5000);
    }
  }
}

async function startBrowser(socket) {
  const browserId = browsers.length + 1;
  const userDataDir = path.join(__dirname, `user_data/browser_${browserId}`);
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir,
    args: [
      `--load-extension=${extensionPath}`,
      `--disable-extensions-except=${extensionPath}`
    ]
  });
  browser._browserId = browserId;
  browsers.push(browser);

  socket.emit('browserStarted', { browserId });

  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.dismiss();
  });

  await checkPage(browser, socket, page);
}

function setupSocketIo(server) {
  const io = socketIo(server);
  io.on('connection', socket => {
    console.log('A user connected');
    socket.on('startBrowser', async () => {
      await startBrowser(socket);
    });
    socket.on('stopRefreshing', () => {
      stopRefreshing = true;
      console.log('Stopping the refreshing process');
    });
  });
}

function startServer() {
  const app = express();
  const server = http.createServer(app);
  setupSocketIo(server);

  app.use(express.static(path.join(__dirname, 'public')));

  server.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
}

startServer();
