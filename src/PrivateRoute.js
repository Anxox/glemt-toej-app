// PrivateRoute.js
import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from 'react-router-dom';


function PrivateRoute({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe(); // Cleanup ved unmount
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Vis loading-indikator
    }

    return user ? children : <Navigate to="/" />;
}

export default PrivateRoute