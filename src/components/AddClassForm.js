// src/components/AddClassForm.js
import React, { useState } from 'react';

function AddClassForm({ onAddClass }) {
    const [newClassName, setNewClassName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddClass(newClassName); // Kald forældre-komponentens funktion, og giv newClassName med som argument.
        setNewClassName(""); // Ryd input-feltet
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Indtast klassenavn"
                className="w-full p-2 border border-gray-300 rounded"
            />
            <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Opret Klasse
            </button>
        </form>
    );
}

export default AddClassForm;