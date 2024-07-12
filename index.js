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

    let jsonData = records.map(record => {
      const lines = record.trim().split('\n');

      const entry = {};
      lines.forEach(line => {
        const [key, value] = line.split(':').map(item => item.trim());
        entry[key] = value;
      });

      return entry;
    });

    jsonData = jsonData.filter(entry => Object.keys(entry).length > 0);

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

async function deletDataFromFile(NIN) {
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
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ],
    userDataDir
  });
  browser._browserId = browserId;
  browsers.push(browser);
  socket.emit('browserStarted', browserId);

  const page = await browser.newPage();
  checkPage(browser, socket, page);
}

async function stopBrowser(browserId) {
  const browser = browsers.find(b => b._browserId === browserId);
  if (browser) {
    await browser.close();
    browsers.splice(browsers.indexOf(browser), 1);
  }
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('startBrowser', async (numBrowsers) => {
    for (let i = 0; i < numBrowsers; i++) {
      await startBrowser(socket);
    }
  });

  socket.on('stopAll', async () => {
    stopRefreshing = true;
    for (const browser of browsers) {
      await browser.close();
    }
    browsers.length = 0;
    socket.emit('allBrowsersStopped');
  });

  socket.on('stopBrowser', async (browserId) => {
    await stopBrowser(browserId);
  


    socket.emit('browserStopped', browserId);
  });

  socket.on('openBrowser', async (browserId) => {
    const browser = browsers.find(b => b._browserId === browserId);
    if (browser) {
      const pages = await browser.pages();
      const lastPage = pages[pages.length - 1];
      await lastPage.bringToFront();
    }
  });

  socket.on('takeScreenshot', async (browserId) => {
    const browser = browsers.find(b => b._browserId === browserId);
    if (browser) {
      const pages = await browser.pages();
      const lastPage = pages[pages.length - 1];
      const screenshotPath = await takeScreenshot(lastPage, browserId);
      socket.emit('screenshotTaken', { browserId, screenshotPath });
      console.log(`Screenshot taken for browser ${browserId} - ${screenshotPath}`);
    }
  });

  socket.on('OperationAgain', async (browserId) => {
    const browser = browsers.find(b => b._browserId === browserId);
    if (browser) {
      const page = await browser.newPage();
      checkPage(browser, socket, page);

      socket.emit('OperationAgainResult', { browserId });
    }
  });

  socket.on('takeAllScreenshots', async () => {
    for (const browser of browsers) {
      await takeAllScreenshots(browser, socket);
    }
  });

  socket.on('restoreBrowsers', () => {
    browsers.forEach(browser => {
      socket.emit('browserStarted', browser._browserId);
    });
  });

  socket.on('getDataInfo', async () => {
    const data = await getDataInfo();
    socket.emit('getDataInfoResult', data);
  });

  socket.on('addDataToFile', async (data) => {
    const { NOM, WIL, NIN, NSS, TEL } = data;

    if (!NOM || !WIL || !NIN || !NSS || !TEL) {
      console.error('Missing data fields');
      return;
    }

    await addDataToFile(NOM, WIL, NIN, NSS, TEL);
    socket.emit('getDataInfoResult', await getDataInfo());
  });

  socket.on('deletDataFromFile', async (data) => {
    const { NIN } = data;
    await deletDataFromFile(NIN);
    socket.emit('getDataInfoResult', await getDataInfo());
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  


  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
