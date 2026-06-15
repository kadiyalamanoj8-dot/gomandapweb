const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let client = null;
let qrCodeData = null;
let isReady = false;

const initializeWhatsApp = () => {
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './whatsapp-auth' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', async (qr) => {
    try {
      // Generate QR as a data URI to display in the frontend
      qrCodeData = await qrcode.toDataURL(qr);
      isReady = false;
      console.log('WhatsApp QR Code generated.');
    } catch (err) {
      console.error('Error generating QR code data URI:', err);
    }
  });

  client.on('ready', () => {
    console.log('WhatsApp Web Client is ready!');
    isReady = true;
    qrCodeData = null; // Clear QR code once logged in
  });

  client.on('authenticated', () => {
    console.log('WhatsApp Web Client authenticated successfully.');
  });

  client.on('auth_failure', msg => {
    console.error('WhatsApp Web Client authentication failure:', msg);
    isReady = false;
    qrCodeData = null;
  });

  client.on('disconnected', (reason) => {
    console.log('WhatsApp Web Client disconnected:', reason);
    isReady = false;
    client.initialize(); // Re-initialize to get a new QR code
  });

  try {
    client.initialize();
  } catch (error) {
    console.error("Failed to initialize WhatsApp Client:", error);
  }
};

const getStatus = () => {
  return {
    isReady,
    qrCode: isReady ? null : qrCodeData
  };
};

const sendMessage = async (phoneNumber, message) => {
  if (!isReady || !client) {
    throw new Error('WhatsApp client is not ready. Please scan the QR code in the Admin Panel.');
  }

  try {
    // Format the phone number (assuming Indian numbers for now, add 91 if missing)
    let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedNumber.length === 10) {
      formattedNumber = `91${formattedNumber}`;
    }
    
    // whatsapp-web.js requires the suffix @c.us
    const chatId = `${formattedNumber}@c.us`;
    await client.sendMessage(chatId, message);
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${phoneNumber}:`, error);
    throw error;
  }
};

module.exports = {
  initializeWhatsApp,
  getStatus,
  sendMessage
};
