import React, { useState } from 'react';
import { auth, db } from '../firebase';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false); // Tilføjet modal state
    const navigate = useNavigate();

    const handleLogin = async (e) => {
      e.preventDefault();
      setError(null); // Nulstil fejl ved hvert forsøg
      setIsLoading(true); // Start loading
      try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate('/dashboard');
      } catch (error) {
          handleAuthError(error); // Brug fejlhåndteringsfunktionen
      } finally {
          setIsLoading(false); // Stop loading
      }
  };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setError(null);
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    displayName: user.displayName, // Gem Google-visningsnavn
                    email: user.email,
                    // Andre felter
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
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                email: user.email,
                // Tilføj andre felter (f.eks. displayName)
            });
            navigate('/dashboard');
        } catch (error) {
            handleAuthError(error); // Brug fejlhåndteringsfunktionen
        } finally {
            setIsLoading(false);
        }
    };

    // Genanvendelig fejlhåndteringsfunktion
    const handleAuthError = (error) => {
        if (error.code === 'auth/email-already-in-use') {
            setError('Denne email er allerede i brug.');
        } else if (error.code === 'auth/invalid-email') {
            setError('Ugyldig email-adresse.');
        } else if (error.code === 'auth/weak-password') {
            setError('Adgangskoden er for svag. Den skal være mindst 6 tegn.');
        } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
            setError("Forkert email eller adgangskode");
        } else {
            setError(error.message);
        }
    };

    // Funktion til at vise/skjule modalen
    const toggleModal = () => {
        setShowModal(!showModal);
        // Nulstil formularen, når modalen lukkes
        if (showModal) {
          setEmail('');
          setPassword('');
          setError(null);
          setIsSignUp(false);
        }

    };

  return (
    <div>
        <button onClick={toggleModal}>Login / Opret Bruger</button>

        {showModal && (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent baggrund
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000, // Sørg for at modalen er over alt andet
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '300px', // Juster bredden efter behov
                }}>
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
                         <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {isLoading ? 'Indlæser...' : (isSignUp ? 'Opret Bruger' : 'Log ind')}
                        </button>
                        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                    </form>

                    {!isSignUp && (
                        <button onClick={handleGoogleLogin} disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: 'green', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                            {isLoading ? 'Indlæser...' : 'Log ind med Google'}
                        </button>
                    )}

                    <p style={{ marginTop: '15px' }}>
                        {isSignUp ? 'Har du allerede en konto?' : 'Har du ikke en konto?'}
                        <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', padding: 0, marginLeft: '5px' }}>
                            {isSignUp ? 'Log ind' : 'Opret bruger'}
                        </button>
                    </p>
                    <button onClick={toggleModal} style={{ width: '100%', padding: '10px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>Luk</button>
                </div>
            </div>
        )}
    </div>
);

};

export default Login;