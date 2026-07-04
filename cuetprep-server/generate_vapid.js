const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const vapidKeys = webpush.generateVAPIDKeys();

const envContent = `
# Web Push VAPID Keys
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

fs.appendFileSync(path.join(__dirname, '.env'), envContent);
console.log('VAPID keys generated and appended to .env');
console.log('Public Key:', vapidKeys.publicKey);
