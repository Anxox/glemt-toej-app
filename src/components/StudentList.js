// src/components/StudentList.js
import React, { useState } from 'react';
import StudentListItem from './StudentListItem';

function StudentList({ students, selectedClass, onAddStudent, onIncrementForgotCount, onDecrementForgotCount, onDeleteStudent }) {
    const [newStudentName, setNewStudentName] = useState("");

     if (!selectedClass) {
        return <div className="mt-8">Vælg en klasse for at se elever.</div>;
    }

    const handleAddStudent = (e) => {
        e.preventDefault();
        if (newStudentName.trim() !== "") {
            onAddStudent(newStudentName);
            setNewStudentName(""); // Nulstil input feltet
        }
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Elever i {selectedClass.name}</h3>

            <form onSubmit={handleAddStudent} className="mb-4">
                <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Indtast elevnavn"
                    className="w-full p-2 border border-gray-300 rounded"
                />
                <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Tilføj Elev
                </button>
            </form>

            <ul className="space-y-2">
                {students.length === 0 ? (
                    <p>Ingen elever i denne klasse endnu.</p>
                ) : (
                students.map((student) => (
                  <StudentListItem
                    key={student.id}
                    student={student}
                    onIncrementForgotCount={onIncrementForgotCount}
                    onDecrementForgotCount={onDecrementForgotCount}
                    onDeleteStudent={onDeleteStudent}
                  />
                ))
                )}
            </ul>
        </div>
    );
}

export default StudentList;