// src/components/StudentListItem.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faMinusCircle, faTrashCan } from '@fortawesome/free-solid-svg-icons';


function StudentListItem({ student, onIncrementForgotCount, onDecrementForgotCount, onDeleteStudent }) {
  return (
    <li className="flex items-center justify-between p-2 border border-gray-200 rounded">
        <div>
            {student.name} - Glemt tøj: {student.forgotCount}
            {student.sportsSessions > 0
                ? ` (${((student.forgotCount / student.sportsSessions) * 100).toFixed(1)}%)`
                : " (Ingen data)"
            }
        </div>
        <div className="flex items-center">
            <FontAwesomeIcon
                icon={faMinusCircle}
                className='cursor-pointer text-red-500 hover:text-red-600 transition duration-200'
                onClick={() => onDecrementForgotCount(student.id, student.forgotCount)}
            />
            <FontAwesomeIcon
                icon={faPlusCircle}
                className='cursor-pointer text-green-500 hover:text-green-600 transition duration-200 ml-2'
                onClick={() => onIncrementForgotCount(student.id, student.forgotCount)}
            />
            <FontAwesomeIcon
              icon={faTrashCan}
              className="cursor-pointer text-red-500 hover:text-red-600 transition duration-200 ml-2"
              onClick={() => onDeleteStudent(student.id)}
            />
        </div>
    </li>
  );
}

export default StudentListItem;