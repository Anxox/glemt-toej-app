// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Importer kun hvis du bruger Cloud Storage

// Firebase konfiguration (hentes fra miljøvariabler)
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Eksportér Firebase-tjenester (så du kan importere dem i andre filer)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Eksportér kun storage, hvis du bruger det

// Fjern denne linje: export default app;  Den er unødvendig.