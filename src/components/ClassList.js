// src/components/ClassList.js
import React from 'react';
import ClassListItem from './ClassListItem';

function ClassList({ classes, selectedClass, onClassSelect, user, showClassInfo, setShowClassInfo, onDeleteClass, onIncrementSessions, onDecrementSessions }) {

    if (!classes || classes.length === 0) {
       return <p>Ingen klasser fundet.</p>
    }
  return (
    <ul className="space-y-4">
        {classes.map((classItem) => (
            <ClassListItem
                key={classItem.id}
                classItem={classItem}
                isSelected={selectedClass === classItem.id}
                onClassSelect={onClassSelect}
                user={user}
                showClassInfo={showClassInfo}
                setShowClassInfo={setShowClassInfo}
                onDeleteClass={onDeleteClass}
                onIncrementSessions={onIncrementSessions}
                onDecrementSessions={onDecrementSessions}
            />
        ))}
    </ul>
  );
}

export default ClassList;