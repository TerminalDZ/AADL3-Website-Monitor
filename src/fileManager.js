const fs = require('fs').promises;

async function getDataInfo() {
    try {
        await fs.writeFile('info.txt', '', { flag: 'wx' }).catch(err => { }); // create file if not exists
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
       // console.error('Error reading from file', error);
        console.error('Error reading from file');
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
       // console.error('Error writing to file', error);
        console.error('Error writing to file');
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
        //console.error('Error writing to file', error);
        console.error('Error writing to file');
    }
}

module.exports = {
    getDataInfo,
    addDataToFile,
    deletDataFromFile
};
