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
            await lastPage.evaluate((data) => {
                const orange_button = document.getElementById("A14");
                if (orange_button) {
                    orange_button.click();
                    setTimeout(() => {
                        

                        const select_wilaya = document.getElementById("A17");
                        const input_nin = document.getElementById("A22");
                        const input_nss = document.getElementById("A27");
                        const input_telephone = document.getElementById("A13");
                        select_wilaya.value = parseInt(data.WIL) + 1;
                        input_nin.value = data.NIN;
                        input_nss.value = data.NSS;
                        input_telephone.value = data.TEL;
                        setTimeout(() => {
                            const checkbox = document.getElementById("A91_1");
                            if (checkbox) {
                                checkbox.click();
                                setTimeout(() => {
                                    const submit = document.getElementById("A55");
                                    if (submit) {
                                        submit.click();
                                        setTimeout(() => {
                                            const accept = document.getElementById("A138");
                                            if (accept) {
                                                accept.click();


                                            }
                                        }, 1000);
                                    }
                                }, 1000);
                            }
                        }, 1000);
                    }, 1000);
                }else{
                    console.log("Orange button not found");
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
