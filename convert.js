const fs = require('fs');

const rawText = `



    NOM: test 1

    WIL: 34

    NIN: 11964117100000000

    NSS: 64020000000000

    TEL: 0550200000000


`;

const records = rawText.split('......................');

const jsonData = records.map(record => {
    const lines = record.trim().split('\n');
    const entry = {};

    lines.forEach(line => {
        const [key, value] = line.split(':').map(item => item.trim());
        if (key && value) {
            entry[key] = value;
        }
    });

    return entry;
}).filter(entry => Object.keys(entry).length > 0); 

fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2), 'utf8');

console.log('Data converted to JSON format and saved to data.json');
