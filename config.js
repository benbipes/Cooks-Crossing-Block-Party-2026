/**
 * Cooks Crossing Block Party 2026 - Central Cloud Configuration
 * -------------------------------------------------------------
 * When you set your Google Sheet Web App URL or Firebase config here
 * and push to GitHub, EVERY NEIGHBOR'S PHONE OR COMPUTER will automatically
 * connect to the same live database!
 */
const CLOUD_CONFIG = {
  // Option 1 (Recommended): Google Sheets Web App URL
  // Follow the 2-minute steps in google-sheets-backend.js, then paste your URL here:
  // Example: "https://script.google.com/macros/s/AKfycb.../exec"
  googleSheetWebAppUrl: "https://script.google.com/macros/s/AKfycbw-iVy_roU_4I9zYx6iXaA5Jt2_w0cc1voAtxoJNm_pNnDscTGIOO_yq7gMVqIWXiO0/exec",

  // Option 2: Firebase Firestore Config
  // Example: { apiKey: "...", projectId: "...", ... }
  firebaseConfig: null
};
