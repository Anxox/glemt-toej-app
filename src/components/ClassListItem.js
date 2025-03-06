// src/components/ClassListItem.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

function ClassListItem({ classItem, isSelected, onClassSelect, showClassInfo, setShowClassInfo, onDeleteClass, onIncrementSessions, onDecrementSessions, user }) {
  return (
    <li className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
        <div className="flex items-center justify-between">
            <span onClick={() => onClassSelect(classItem.id)} className={`cursor-pointer text-blue-600 hover:underline ${isSelected ? 'font-bold' : ''}`}>
                {classItem.name}
            </span>

            {user && user.uid === classItem.ownerId && (
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowClassInfo(showClassInfo === classItem.id ? null : classItem.id)}
                        className="px-3 py-1 rounded text-white bg-green-500 hover:bg-green-600 transition duration-200"
                    >
                        {showClassInfo === classItem.id ? "Skjul Info" : "Vis Info"}
                    </button>
                    <button onClick={() => onIncrementSessions(classItem.id, classItem.sportsSessions)}
                        className="px-3 py-1 rounded text-white bg-green-500 hover:bg-green-600 transition duration-200">
                        +
                    </button>
                     <button onClick={() => onDecrementSessions(classItem.id, classItem.sportsSessions)}
                        className="px-3 py-1 rounded text-white bg-red-500 hover:bg-red-600 transition duration-200">
                         -
                    </button>

                    <button onClick={() => onDeleteClass(classItem.id)}
                        className="px-3 py-1 rounded text-white bg-black hover:bg-gray-800 transition duration-200">
                       <FontAwesomeIcon icon={faTrashCan} className="mr-1" />
                         Slet
                    </button>
                </div>
            )}
        </div>

         {showClassInfo === classItem.id && (
            <div className="mt-4">
                Antal idrætssessioner: {classItem.sportsSessions}
            </div>
        )}
    </li>
);
}

export default ClassListItem;