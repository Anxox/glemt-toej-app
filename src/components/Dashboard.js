// src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";

function Dashboard() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const querySnapshot = await getDocs(collection(db, "classes"));
        setClasses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Fejl ved hentning af klasser:", error);
      }
    }

    fetchClasses();
  }, []);

  return (
    <div>
      <h2>Klasser</h2>
      <button onClick={() => signOut(auth)}>Log ud</button>
      <ul>
        {classes.map(cls => (
          <li key={cls.id}>{cls.name} - {cls.sportsSessions} træninger</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
