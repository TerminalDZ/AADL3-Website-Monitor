const fs = require('fs').promises;

async function getDataInfo() {
    try {
        await fs.writeFile('info.json', '[]', { flag: 'wx' }).catch(err => { }); // create file if not exists
        const data = await fs.readFile('info.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading from file', error);
        return [];
    }
}

async function addDataToFile(NOM, WIL, NIN, NSS, TEL) {
    try {
        const data = await getDataInfo();
        data.push({ NOM, WIL, NIN, NSS, TEL });
        await fs.writeFile('info.json', JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to file', error);
    }
}

async function deletDataFromFile(NIN) {
    try {
        let data = await getDataInfo();
        data = data.filter(entry => entry.NIN !== NIN);
        await fs.writeFile('info.json', JSON.stringify(data, null, 2), 'utf8');
        console.log(`Data with NIN: ${NIN} has been deleted.`);
    } catch (error) {
        console.error('Error writing to file', error);
    }
}

module.exports = {
    getDataInfo,
    addDataToFile,
    deletDataFromFile
};
