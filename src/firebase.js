import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Kun hvis du bruger storage

const firebaseConfig = {
  apiKey: "AIzaSyCYaeNKDbNkJ2yyVxQsu8pI1mziQOkySkI",
  authDomain: "glemttoejapp.firebaseapp.com",
  projectId: "glemttoejapp",
  storageBucket: "glemttoejapp.firebasestorage.app",
  messagingSenderId: "125487457756",
  appId: "1:125487457756:web:bcc6b0b05340b34c8d5b19"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Kun hvis du bruger storage
export default app;
