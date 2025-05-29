/*
 * This fills in the Firebase credentials in the service worker file
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const swPath = path.join(__dirname, 'public', 'firebase-messaging-sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace placeholders with actual values
swContent = swContent.replace('FIREBASE_API_KEY', process.env.VITE_FIREBASE_API_KEY);
swContent = swContent.replace('FIREBASE_AUTH_DOMAIN', process.env.VITE_FIREBASE_AUTH_DOMAIN);
swContent = swContent.replace('FIREBASE_PROJECT_ID', process.env.VITE_FIREBASE_PROJECT_ID);
swContent = swContent.replace('FIREBASE_MESSAGING_SENDER_ID', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
swContent = swContent.replace('FIREBASE_APP_ID', process.env.VITE_FIREBASE_APP_ID);

fs.writeFileSync(swPath, swContent);