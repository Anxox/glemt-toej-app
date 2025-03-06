// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Importer KUN hvis du bruger Cloud Storage

let firebaseConfig; // Definer firebaseConfig uden for fetchConfig
let app; // Definer app i modul-scope
export let auth; // Eksporter auth, db og storage i modul-scope (brug 'let' for at kunne ændre dem senere)
export let db;
export let storage;

async function fetchConfig() {
    if (firebaseConfig && app) { // Tjek om både config og app er initialiseret
        return; // Returner tidligt, hvis vi allerede har config og app
    }

    try {
        const response = await fetch('/__/firebase/init.json'); // Hent config
        if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
        }
        firebaseConfig = await response.json(); // Gem config

        // Initialiser Firebase *efter* at have hentet config:
        app = initializeApp(firebaseConfig); // Initialiser app og gem i modul-scope variablen
        auth = getAuth(app); // Initialiser auth og gem i modul-scope variablen
        db = getFirestore(app); // Initialiser db og gem i modul-scope variablen
        storage = getStorage(app); // Initialiser storage og gem i modul-scope variablen


    } catch (error) {
        console.error("Error fetching Firebase config:", error);
        // Vis en BRUGERVENLIG fejlbesked (IKKE alert!).
        // I en rigtig app ville du bruge en pænere måde at vise fejl på (f.eks. en modal).
        alert("Fejl ved indlæsning af Firebase-konfiguration. Applikationen kan ikke starte.");
        // Overvej at forhindre, at resten af din app indlæses, hvis dette sker.
    }
}

fetchConfig(); // Kald funktionen for at hente config