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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/Modal';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
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
                    displayName: user.displayName,
                    email: user.email,
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
            });
            navigate('/dashboard');
        } catch (error) {
            handleAuthError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthError = (error) => {
        if (error.code === 'auth/email-already-in-use') {
            setError('Denne email er allerede i brug.');
        } else if (error.code === 'auth/invalid-email') {
            setError('Ugyldig email-adresse.');
        } else if (error.code === 'auth/weak-password') {
            setError('Adgangskoden er for svag. Den skal være mindst 6 tegn.');
        } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            setError("Forkert email eller adgangskode.");
        } else {
            setError("Der opstod en fejl. Prøv igen senere.");
            console.error("Unhandled auth error:", error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const toggleModal = () => {
        console.log("toggleModal blev kaldt!");
        setShowModal(!showModal);
        setEmail('');
        setPassword('');
        setError(null);
        setIsSignUp(false);
    };

    return (
        <div>
            <button onClick={toggleModal} className="login-button">Login / Opret Bruger</button>
            {showModal && (
                <Modal isOpen={showModal} onClose={toggleModal}>
                    <div className="login-container">
                        <button onClick={handleGoogleLogin} disabled={isLoading} className="google-login-button">
                            <FontAwesomeIcon icon={faGoogle} className="google-icon" />
                            Log ind med Google
                        </button>
                        <h2>{isSignUp ? 'Opret Bruger' : 'Login'}</h2>
                        <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Indtast din email" required />
                            {error && error.includes("email") && <p className="error-message">{error}</p>}
                            <label htmlFor="password">Adgangskode:</label>
                            <div className="password-input-container">
                                <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Indtast din adgangskode" required />
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} onClick={togglePasswordVisibility} className="password-icon" />
                            </div>
                            {error && error.includes("password") && <p className="error-message">{error}</p>}
                            <button type="submit" disabled={isLoading}>{isLoading ? 'Indlæser...' : (isSignUp ? 'Opret Bruger' : 'Log ind')}</button>
                        </form>
                        <p>
                            {isSignUp ? 'Har du allerede en konto?' : 'Har du ikke en konto?'}
                            <button type="button" onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Log ind' : 'Opret bruger'}</button>
                        </p>
                        <button onClick={toggleModal}>Luk</button>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Login;
