const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const { startBrowser, stopBrowser, takeAllScreenshots, checkPage, takeScreenshot } = require('./puppeteerManager');
const { getDataInfo, addDataToFile, deletDataFromFile } = require('./fileManager');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const browsers = [];
let stopRefreshing = false;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('startBrowser', async (numBrowsers) => {
        for (let i = 0; i < numBrowsers; i++) {
            await startBrowser(socket, browsers, stopRefreshing);
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
        await stopBrowser(browserId, browsers);
        socket.emit('browserStopped', browserId);
    });

    socket.on('takeScreenshot', async (browserId) => {
        const browser = browsers.find(b => b._browserId === browserId);
        if (browser) {
            const pages = await browser.pages();
            const lastPage = pages[pages.length - 1];
            const screenshotPath = await takeScreenshot(lastPage, browserId);
            if (screenshotPath) {
                socket.emit('screenshotTaken', { browserId, screenshotPath });
                console.log(`Screenshot taken for browser ${browserId} - ${screenshotPath}`);
            } else {
                console.error(`Failed to take screenshot for browser ${browserId}`);
            }
        }
    });

    socket.on('OperationAgain', async (browserId) => {
        const browser = browsers.find(b => b._browserId === browserId);
        if (browser) {
            const pages = await browser.pages();
            const lastPage = pages[pages.length - 1];
            await lastPage.evaluate(() => {
                window.localStorage.clear();
                window.sessionStorage.clear();
                document.cookie.split(";").forEach(function (c) {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });
            });

            const newPage = await browser.newPage();
            checkPage(browser, socket, newPage, stopRefreshing);

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

    socket.on('getDataInfoSelect', async () => {
        const data = await getDataInfo();
        socket.emit('dataSelectedResult', data);
    });

    socket.on('dataSelected', async (index) => {
        const data = await getDataInfo();
        socket.emit('dataSelected', data[index]);
    });

    socket.on('AutoFill', async (browserId, data) => {
        const browser = browsers.find(b => b._browserId === browserId);
        if (browser) {
            const pages = await browser.pages();
            const lastPage = pages[pages.length - 1];

            await lastPage.evaluate(async (data) => {
                const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

                const clickButton = async (selector) => {
                    const button = document.getElementById(selector);
                    if (button) {
                        button.click();
                        await delay(1000); // wait for the page to load
                    } else {
                        throw new Error(`${selector} not found`);
                    }
                };

                const fillField = (selector, value) => {
                    const field = document.getElementById(selector);
                    if (field) {
                        field.value = value;
                    } else {
                        throw new Error(`${selector} not found`);
                    }
                };

                try {
                    await clickButton("A14");

                    fillField("A17", parseInt(data.WIL) + 1);
                    fillField("A22", data.NIN);
                    fillField("A27", data.NSS);
                    fillField("A13", data.TEL);

                    await clickButton("A91_1");
                    await clickButton("A55");
                    await clickButton("A138");

                    const success = document.body.innerHTML.includes("لقد تمت عملية الإكتتاب بنجاح");
                    if (success) {
                        console.log("Data has been added successfully");
                    }
                } catch (error) {
                    console.error(error);
                }
            }, data);
        }
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
        await deletDataFromFile(data);
        socket.emit('getDataInfoResult', await getDataInfo());
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
