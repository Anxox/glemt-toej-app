import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Importer auth og db
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Importer Firestore funktioner


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false); // Tilstand til at skifte mellem login og signup
    const [error, setError] = useState(null);       // Tilstand til at gemme fejlbeskeder
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);  // Nulstil fejl før hvert forsøg
        setIsLoading(true); // Start loading-indikatoren
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard'); // Omdiriger til dashboard ved succes
        } catch (error) {
            handleAuthError(error); // Brug den forbedrede fejlhåndteringsfunktion
        } finally {
            setIsLoading(false); // Stop loading-indikatoren (uanset succes/fejl)
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setError(null);
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Tjek om brugeren allerede findes i Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            // Hvis brugeren IKKE findes, opret et dokument
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    displayName: user.displayName, // Gem Google-visningsnavn (hvis det findes)
                    email: user.email, // Gem email
                    // Tilføj evt. andre felter her (f.eks. photoURL)
                });
            }

            navigate('/dashboard');
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };



    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;
            // Gem brugerdata i Firestore EFTER succesfuld oprettelse
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                email: user.email,
                //Tilføj evt andre felter
            });

            navigate('/dashboard');
        } catch (error) {
            handleAuthError(error); // Brug den forbedrede fejlhåndteringsfunktion
        } finally {
            setIsLoading(false); // Stop loading
        }
    };
    // Forbedret fejlhåndteringsfunktion
    const handleAuthError = (error) => {
        if (error.code === 'auth/email-already-in-use') {
            setError('Denne email er allerede i brug.');
        } else if (error.code === 'auth/invalid-email') {
            setError('Ugyldig email-adresse.');
        } else if (error.code === 'auth/weak-password') {
            setError('Adgangskoden er for svag. Den skal være mindst 6 tegn.');
        } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            setError("Forkert email eller adgangskode."); // Kombineret fejl for bedre UX
        } else {
            setError("Der opstod en fejl. Prøv igen senere."); // Generel fejlbesked
            console.error("Unhandled auth error:", error); // Log den fulde fejl for debugging
        }
    };



    return (
        <div>
            <h2>{isSignUp ? 'Opret Bruger' : 'Login'}</h2>

            <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Adgangskode"
                    required
                    style={{ display: 'block', marginBottom: '10px', width: '100%' }}
                />
                <button type="submit" disabled={isLoading} >
                    {isLoading ? 'Indlæser...' : (isSignUp ? 'Opret Bruger' : 'Log ind')}
                </button>

                {/* Vis fejlbesked, HVIS der er en fejl */}
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>

            {!isSignUp && (
                <button onClick={handleGoogleLogin} disabled={isLoading}>
                    Log ind med Google
                </button>
            )}

            <p>
                {isSignUp ? 'Har du allerede en konto?' : 'Har du ikke en konto?'}
                <button type="button" onClick={() => setIsSignUp(!isSignUp)}>  {/*Skift mellem login og signup */}
                    {isSignUp ? 'Log ind' : 'Opret bruger'}
                </button>
            </p>
        </div>
    );
};

export default Login;