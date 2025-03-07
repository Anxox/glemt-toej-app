import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase"; // Hent auth fra firebase.js
import { onAuthStateChanged } from "firebase/auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Unsubscribe ved unmount
  }, []);

  return (
    <Router> {/* 👈 Tilføj BrowserRouter */}
      <div className="App">
        <h1>Glemt Tøj App</h1>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
