import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore"; // Sørg for at getDoc er importeret
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faMinusCircle, faTrashCan } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [newClassName, setNewClassName] = useState("");
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [newStudentName, setNewStudentName] = useState("");
    const [user, setUser] = useState(null);
    const [showClassInfo, setShowClassInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [incrementIconColor, setIncrementIconColor] = useState({});
    const [decrementIconColor, setDecrementIconColor] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchClasses(user.uid);
            } else {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchClasses = async (userId) => {
        setIsLoading(true);
        try {
            const classQuery = query(collection(db, "classes"), where("ownerId", "==", userId));
            const classSnapshot = await getDocs(classQuery);
            const classList = classSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setClasses(classList);
        } catch (error) {
            console.error("Fejl ved hentning af klasser:", error);
            alert("Der opstod en fejl ved indlæsning af klasser.");
        } finally {
            setIsLoading(false);
        }
    };
  // Hent elever for en valgt klasse (og klassens sportsSessions)
    const fetchStudents = async (classId) => {
        setIsLoading(true);
        setSelectedClass(classId);
        try {
            const studentSnapshot = await getDocs(collection(db, `classes/${classId}/students`));
            const studentList = studentSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // RETTET: Definer doc-referencen *først*.  Dette var den primære fejl.
            const classRef = doc(db, "classes", classId); // Opret en *reference*
            const classDoc = await getDoc(classRef);       // *Hent* dokumentet vha. referencen.

            if (classDoc.exists()) {
                const classData = classDoc.data();
                const sportsSessions = classData.sportsSessions;

                const studentsWithData = studentList.map(student => ({
                    ...student,
                    sportsSessions: sportsSessions,
                }));
                setStudents(studentsWithData);

            } else {
                console.error("Klasse ikke fundet:", classId);
                alert("Den valgte klasse findes ikke.");
                setStudents([]);
            }
        } catch (error) {
            console.error("Fejl ved hentning af elever:", error);
            alert("Der opstod en fejl ved indlæsning af elever.");
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };


    const handleAddClass = async () => {
      if (newClassName.trim() === "" || !user) {
          alert("Udfyld venligst klassenavnet.");
          return;
      }
  
      try {
          const classRef = await addDoc(collection(db, "classes"), { //Her laves der et object, som indeholder det der skal gemmes i databasen
              name: newClassName,
              ownerId: user.uid,  // <--- MEGET VIGTIGT
              sportsSessions: 0,
          });
  
          const newClass = { id: classRef.id, name: newClassName, ownerId: user.uid, sportsSessions: 0 }; //Dette bruges kun til at opdatere din lokale state.
          setClasses([...classes, newClass]);
          setNewClassName("");
          setSelectedClass(classRef.id);
          fetchStudents(classRef.id);
  
      } catch (error) {
          console.error("Fejl ved oprettelse af klasse:", error);
          alert("Der opstod en fejl ved oprettelse af klassen.");
      }
  };

    const handleAddStudent = async () => {
        if (!selectedClass || newStudentName.trim() === "") {
            alert("Vælg en klasse og udfyld elevnavnet.");
            return;
        }

        try {
            const studentRef = await addDoc(collection(db, `classes/${selectedClass}/students`), {
                name: newStudentName,
                forgotCount: 0,
            });

            //  Opdater *ikke* sportsSessions her.
            setStudents([...students, { id: studentRef.id, name: newStudentName, forgotCount: 0, sportsSessions: students[0]?.sportsSessions || 0 }]);
            setNewStudentName("");
        } catch (error) {
            console.error("Fejl ved oprettelse af elev:", error);
            alert("Der opstod en fejl ved tilføjelse af elev.");
        }
    };

    const incrementForgotCount = async (studentId, currentCount) => {
        const oldCount = currentCount;

        setIncrementIconColor(prev => ({ ...prev, [studentId]: 'orange' }));
        setTimeout(() => {
            setIncrementIconColor(prev => ({ ...prev, [studentId]: undefined }));
        }, 500);

        setStudents(students.map(student =>
            student.id === studentId ? { ...student, forgotCount: currentCount + 1 } : student
        ));

        try {
            const studentRef = doc(db, `classes/${selectedClass}/students`, studentId);
            await updateDoc(studentRef, { forgotCount: currentCount + 1 });

        } catch (error) {
            console.error("Fejl ved opdatering af glemt tøj:", error);
            setStudents(students.map(student =>
                student.id === studentId ? { ...student, forgotCount: oldCount } : student
            ));
            alert("Der opstod en fejl. Ændringen blev ikke gemt.");
        }
    };

    const decrementForgotCount = async (studentId, currentCount) => {
        const oldCount = currentCount;
        const newCount = Math.max(0, currentCount - 1);

        setDecrementIconColor(prev => ({ ...prev, [studentId]: 'orange' }));
        setTimeout(() => {
            setDecrementIconColor(prev => ({ ...prev, [studentId]: undefined }));
        }, 500);

        setStudents(students.map(student =>
            student.id === studentId ? { ...student, forgotCount: newCount } : student
        ));


        try {
            const studentRef = doc(db, `classes/${selectedClass}/students`, studentId);
            await updateDoc(studentRef, { forgotCount: newCount });

        } catch (error) {
            console.error("Fejl ved opdatering af glemt tøj:", error);
            setStudents(students.map(student =>
                student.id === studentId ? { ...student, forgotCount: oldCount } : student
            ));
            alert("Der opstod en fejl. Ændringen blev ikke gemt.");
        }
    };

    const deleteStudent = async (studentId) => {
        if (!window.confirm("Er du sikker på, at du vil slette denne elev?")) return;

        try {
            await deleteDoc(doc(db, `classes/${selectedClass}/students`, studentId));
            setStudents(students.filter(student => student.id !== studentId));
        } catch (error) {
            console.error("Fejl ved sletning af elev:", error);
            alert("Der opstod en fejl ved sletning af eleven.");
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        navigate("/");
    };

    const incrementSportsSessions = async (classId, currentSessions) => {
        const oldSessions = currentSessions;
        try {
            const classRef = doc(db, "classes", classId);
            setClasses(classes.map((classItem) =>
                classItem.id === classId ? { ...classItem, sportsSessions: currentSessions + 1 } : classItem
            ));
            await updateDoc(classRef, { sportsSessions: currentSessions + 1 });
            //Opdater efter ændring
            if (selectedClass === classId) {
                fetchStudents(classId);
            }

        } catch (error) {
            setClasses(classes.map((classItem) =>
                classItem.id === classId ? { ...classItem, sportsSessions: oldSessions } : classItem
            ));
            console.error("Fejl ved opdatering af idrætssessioner:", error);
            alert("Der opstod en fejl. Ændringen blev ikke gemt.");
        }
    };

    const decrementSportsSessions = async (classId, currentSessions) => {
        if (currentSessions <= 0) {
            alert("Antal idrætssessioner kan ikke være mindre end 0.");
            return;
        }
        const oldSessions = currentSessions;
        try {
            const classRef = doc(db, "classes", classId);
            setClasses(classes.map((classItem) =>
                classItem.id === classId ? { ...classItem, sportsSessions: currentSessions - 1 } : classItem
            ));
            await updateDoc(classRef, { sportsSessions: currentSessions - 1 });

            //Opdater efter ændring
            if (selectedClass === classId) {
                fetchStudents(classId);
            }
        } catch (error) {
            setClasses(classes.map((classItem) =>
                classItem.id === classId ? { ...classItem, sportsSessions: oldSessions } : classItem
            ));
            console.error("Fejl ved opdatering af idrætssessioner:", error);
            alert("Der opstod en fejl. Ændringen blev ikke gemt.");
        }
    };

    const deleteClass = async (classId) => {
        if (!window.confirm("Er du sikker på, at du vil slette denne klasse og ALLE tilhørende elever? Denne handling kan IKKE fortrydes.")) {
            return;
        }

        try {
            const studentsRef = collection(db, `classes/${classId}/students`);
            const studentSnapshot = await getDocs(studentsRef);
            studentSnapshot.forEach(async (studentDoc) => {
                await deleteDoc(doc(db, `classes/${classId}/students`, studentDoc.id));
            });

            await deleteDoc(doc(db, "classes", classId));

            setClasses(classes.filter(classItem => classItem.id !== classId));
            setSelectedClass(null);
            setStudents([]);

        } catch (error) {
            console.error("Fejl ved sletning af klasse:", error);
            alert("Der opstod en fejl under sletningen.  Prøv igen.");
        }
    };

    return (
        <div style={styles.container}>
            <h2 className="text-4xl font-extrabold text-indigo-600 mb-8">Mine Klasser</h2>

            {/* Opret ny klasse */}
            <div style={styles.form}>
                <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Indtast klassenavn"
                    style={styles.input}
                />
                <button onClick={handleAddClass} style={styles.button}>
                    Opret Klasse
                </button>
            </div>

            {/* Vis loading indikator */}
            {isLoading && <p>Indlæser...</p>}

            {/* Liste over klasser */}
            <ul style={styles.list}>
                {!isLoading && classes.map((classItem) => (
                    <li key={classItem.id} style={styles.listItem}>
                        <span onClick={() => fetchStudents(classItem.id)} style={styles.listItemClickable}>
                            {classItem.name}
                        </span>

                        {user && user.uid === classItem.ownerId && (
                            <>
                                <button
                                    onClick={() => setShowClassInfo(showClassInfo === classItem.id ? null : classItem.id)}
                                    style={styles.smallButtonGreen}
                                >
                                    {showClassInfo === classItem.id ? "Skjul Info" : "Vis Info"}
                                </button>
                                <button onClick={() => incrementSportsSessions(classItem.id, classItem.sportsSessions)} style={styles.smallButtonGreen}> + </button>
                                {/* Fjern den duplikerede + knap */}
                                <button onClick={() => decrementSportsSessions(classItem.id, classItem.sportsSessions)} style={styles.smallButtonRed}> - </button>
                                <button onClick={() => deleteClass(classItem.id)} style={styles.deleteButton}>
                                    <FontAwesomeIcon icon={faTrashCan} style={{ marginRight: '5px' }} />
                                    Slet Klasse
                                </button>
                            </>
                        )}

                        {showClassInfo === classItem.id && (
                            <div style={{ marginTop: "5px" }}>
                                Antal idrætssessioner: {classItem.sportsSessions}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {/* Elev-sektion */}
            {selectedClass && (
                <div>
                    <h3>Elever i {classes.find(c => c.id === selectedClass)?.name}</h3>

                    {/* Opret elev */}
                    <div style={styles.form}>
                        <input
                            type="text"
                            value={newStudentName}
                            onChange={(e) => setNewStudentName(e.target.value)}
                            placeholder="Indtast elevnavn"
                            style={styles.input}
                        />
                        <button onClick={handleAddStudent} style={styles.button}>
                            Tilføj Elev
                        </button>
                    </div>

                    {/* Elevliste */}
                    <ul style={styles.list}>
                        {students.map((student) => (
                            <li key={student.id} style={styles.listItem}>
                                {student.name} - Glemt tøj: {student.forgotCount}
                                {student.sportsSessions > 0
                                    ? (() => {
                                        const percentage = (student.forgotCount / student.sportsSessions) * 100;
                                        return isNaN(percentage) || !isFinite(percentage)
                                            ? "(Ugyldig data)"
                                            : `(${percentage.toFixed(1)}%)`;
                                    })()
                                    : "(Ingen data)"
                                }
                                <span style={{ marginLeft: '10px' }}>
                                    <FontAwesomeIcon
                                        icon={faMinusCircle}
                                        style={{
                                            cursor: 'pointer',
                                            color: decrementIconColor[student.id] || (student.forgotCount === 0 ? 'gray' : 'red')
                                        }}
                                        onClick={() => decrementForgotCount(student.id, student.forgotCount)}
                                    />
                                    <FontAwesomeIcon
                                        icon={faPlusCircle}
                                        style={{
                                            cursor: 'pointer',
                                            color: incrementIconColor[student.id] || 'green',
                                            marginLeft: '5px'
                                        }}
                                        onClick={() => incrementForgotCount(student.id, student.forgotCount)}
                                    />
                                </span>
                                <FontAwesomeIcon
                                    icon={faTrashCan}
                                    style={{ cursor: 'pointer', color: 'red', marginLeft: 10 }}
                                    onClick={() => deleteStudent(student.id)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <button onClick={handleLogout} style={styles.logoutButton}>Log Ud</button>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
    },
    form: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
    },
    button: {
        padding: "10px",
        fontSize: "16px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    smallButtonGreen: {
        marginLeft: "10px",
        padding: "5px",
        fontSize: "14px",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    smallButtonRed: {
        marginLeft: "10px",
        padding: "5px",
        fontSize: "14px",
        backgroundColor: "red",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    deleteButton: {
        marginLeft: "10px",
        padding: "5px",
        fontSize: "14px",
        backgroundColor: "black",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    logoutButton: {
        marginTop: "20px",
        padding: "10px",
        fontSize: "16px",
        backgroundColor: "red",
        color: "white",
        border: "none",
        cursor: "pointer",
    },
    listItemClickable: {
        cursor: "pointer",
        textDecoration: "underline",
    },
    list: {
        listStyle: "none",
        padding: "0",
    },
    listItem: {
        padding: "10px",
        margin: "5px",
        backgroundColor: "#f4f4f4",
        borderRadius: "5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },
};

export default Dashboard;