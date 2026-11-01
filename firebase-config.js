// Firebase web app configuration for FreeForm.
// Web config values are public client configuration; secure access with Realtime Database Rules.
export const firebaseConfig = {
  apiKey: "AIzaSyAMBBUEHWeeZNhlRVVHTfwfky0vlMFdTlk",
  authDomain: "freeform-4f8df.firebaseapp.com",
  databaseURL: "https://freeform-4f8df-default-rtdb.firebaseio.com",
  projectId: "freeform-4f8df",
  storageBucket: "freeform-4f8df.firebasestorage.app",
  messagingSenderId: "591893852633",
  appId: "1:591893852633:web:f7a79fbe4d4cc89834e9c8",
  measurementId: "G-GTE4S0JSMX"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  ![firebaseConfig.apiKey, firebaseConfig.appId].some(v => String(v).includes('PASTE_'))
);
