const axios = require('axios');
const fs = require('fs').promises;
jest.mock('axios');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

const { sendTelegramMessage, getDataInfo, addDataToFile } = require('./index.js');

describe('sendTelegramMessage', () => {
  it('sends a message to Telegram', async () => {
    axios.post.mockResolvedValue({ data: 'success' });
    const message = 'Test message';
    await sendTelegramMessage(message);
    expect(axios.post).toHaveBeenCalledWith(`https://api.telegram.org/botTELEGRAM_TOKEN/sendMessage`, {
      chat_id: 'CHAT_ID',
      text: message
    });
  });

  it('handles errors when sending message to Telegram', async () => {
    axios.post.mockRejectedValue(new Error('Failed to send message'));
    console.error = jest.fn();
    const message = 'Test message';
    await sendTelegramMessage(message);
    expect(console.error).toHaveBeenCalledWith('Failed to send message to Telegram:', new Error('Failed to send message'));
  });
});

describe('getDataInfo', () => {
  it('reads data from file and returns parsed JSON', async () => {
    const fileContent = 'NOM: John\nWIL: 1\nNIN: 123456789\n......................\nNOM: Jane\nWIL: 2\nNIN: 987654321';
    fs.readFile.mockResolvedValue(fileContent);
    const data = await getDataInfo();
    expect(data).toEqual([
      { NOM: 'John', WIL: '1', NIN: '123456789' },
      { NOM: 'Jane', WIL: '2', NIN: '987654321' }
    ]);
  });

  it('handles errors when reading data from file', async () => {
    fs.readFile.mockRejectedValue(new Error('Failed to read file'));
    console.error = jest.fn();
    const data = await getDataInfo();
    expect(console.error).toHaveBeenCalledWith('Error reading from file', new Error('Failed to read file'));
    expect(data).toEqual([]);
  });
});

describe('addDataToFile', () => {
  it('adds data to the file', async () => {
    const fileContent = 'NOM: John\nWIL: 1\nNIN: 123456789';
    fs.readFile.mockResolvedValue(fileContent);
    fs.writeFile.mockResolvedValue();
    await addDataToFile('Jane', '2', '987654321', '654321987', '123456789');
    expect(fs.writeFile).toHaveBeenCalledWith('info.txt', expect.stringContaining('Jane'));
  });
});
