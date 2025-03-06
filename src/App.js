// src/App.js
import React, { useEffect, useState } from "react";
import { auth } from "./firebase"; // Hent auth fra firebase.js
import { onAuthStateChanged } from "firebase/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Unsubscribe ved unmount
  }, []);

  return (
    <div className="App">
      <h1>Glemt Tøj App</h1>
      {user ? <Dashboard /> : <Login />}
    </div>
  );
}

export default App;
