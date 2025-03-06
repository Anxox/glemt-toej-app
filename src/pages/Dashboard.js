import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import ClassList from '../components/ClassList';
import StudentList from '../components/StudentList';
import AddClassForm from "../components/AddClassForm";
import Modal from "../components/Modal";

const Dashboard = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [user, setUser] = useState(null);
    const [showClassInfo, setShowClassInfo] = useState(null);  // Hvilken klasses info vises?
    const [isLoading, setIsLoading] = useState(false);       // Loading state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal til sletning
    const [studentToDelete, setStudentToDelete] = useState(null);     // ID på eleven, der skal slettes
    const [classToDelete, setClassToDelete] = useState(null);       // ID på klassen, der skal slettes

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => { // Lytter til ændringer i auth state
            if (authUser) {
                setUser(authUser); // Sæt user state, hvis brugeren er logget ind
                fetchClasses(authUser.uid); // Hent klasser for den bruger
            } else {
                navigate("/"); // Omdiriger til login, hvis ikke logget ind
            }
        });

        return () => unsubscribe(); // Afmeld listener, når komponenten unmountes
    }, [navigate]); // Dependency array: Kør kun useEffect, når navigate ændres

    const fetchClasses = async (userId) => {
        setIsLoading(true); // Start loading
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
            alert("Der opstod en fejl ved indlæsning af klasser."); // Vis fejlmeddelelse
        } finally {
            setIsLoading(false); // Stop loading (uanset om det lykkedes eller ej)
        }
    };

    const fetchStudents = async (classId) => {
        setIsLoading(true);
        setSelectedClass(classId); // Sæt den valgte klasse
        try {
            const classRef = doc(db, "classes", classId);
            const classDoc = await getDoc(classRef);

            if (classDoc.exists()) {
                const studentSnapshot = await getDocs(collection(db, `classes/${classId}/students`));
                const studentList = studentSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setStudents(studentList);

            } else {
                console.error("Klasse ikke fundet:", classId);
                alert("Den valgte klasse findes ikke.");
                setStudents([]); // Ryd elever, hvis klassen ikke findes
            }
        } catch (error) {
            console.error("Fejl ved hentning af elever:", error);
            alert("Der opstod en fejl ved indlæsning af elever.");
            setStudents([]); // Ryd elever ved fejl
        } finally {
            setIsLoading(false);
        }
    };



    const handleAddClass = async (newClassName) => { // Modtager klassenavn som argument
        if (newClassName.trim() === "" || !user) {
            alert("Udfyld venligst klassenavnet.");
            return;
        }

        try {
            const classRef = await addDoc(collection(db, "classes"), {
                name: newClassName,
                ownerId: user.uid,
                sportsSessions: 0,
            });

            const newClass = { id: classRef.id, name: newClassName, ownerId: user.uid, sportsSessions: 0 };
            setClasses([...classes, newClass]); // Tilføj den nye klasse til state
            setSelectedClass(classRef.id); // Vælg den nye klasse
            fetchStudents(classRef.id);   // Hent elever for den nye klasse (tom i starten)

        } catch (error) {
            console.error("Fejl ved oprettelse af klasse:", error);
            alert("Der opstod en fejl ved oprettelse af klassen.");
        }
    };



    const handleAddStudent = async (newStudentName) => { // Modtager elevnavn som argument

        if (!selectedClass || newStudentName.trim() === "") {
            alert("Vælg en klasse og udfyld elevnavnet.");
            return;
        }
        try {
            const studentRef = await addDoc(collection(db, `classes/${selectedClass.id}/students`), { // Brug selectedClass.id
                name: newStudentName,
                forgotCount: 0,
            });

            setStudents([...students, { id: studentRef.id, name: newStudentName, forgotCount: 0}]);
            //setNewStudentName(""); //Fjernet, da det nu er StudentList's ansvar
        } catch (error) {
            console.error("Fejl ved oprettelse af elev:", error);
            alert("Der opstod en fejl ved tilføjelse af elev.");
        }
    };


    const incrementForgotCount = async (studentId, currentCount) => {
        try {
            const studentRef = doc(db, `classes/${selectedClass}/students`, studentId);
            await updateDoc(studentRef, { forgotCount: currentCount + 1 });
            // Opdater lokalt for hurtig UI-opdatering:
            setStudents(students.map(student =>
                student.id === studentId ? { ...student, forgotCount: currentCount + 1 } : student
            ));

        } catch (error) {
            console.error("Fejl ved opdatering af glemt tøj:", error);
            alert("Der opstod en fejl. Ændringen blev ikke gemt.");
        }
    };


    const decrementForgotCount = async (studentId, currentCount) => {
        const newCount = Math.max(0, currentCount - 1); // Sikrer, at forgotCount ikke bliver negativ

        try {
            const studentRef = doc(db, `classes/${selectedClass}/students`, studentId);
            await updateDoc(studentRef, { forgotCount: newCount });
            // Opdater lokalt for hurtig UI-opdatering:
            setStudents(students.map(student =>
                student.id === studentId ? { ...student, forgotCount: newCount } : student
            ));

        } catch (error) {
            console.error("Fejl ved opdatering af glemt tøj:", error);
            alert("Der opstod en fejl. Ændringen blev ikke gemt.");
        }
    };


      const deleteStudent = (studentId) => {
        openDeleteStudentModal(studentId); // Åbn modal, gem ID
    };


    const handleLogout = async () => {
        await auth.signOut();
        navigate("/");
    };

    const incrementSportsSessions = async (classId, currentSessions) => {

        try {
            const classRef = doc(db, "classes", classId);
             setClasses(classes.map((classItem) =>
                classItem.id === classId ? { ...classItem, sportsSessions: currentSessions + 1 } : classItem
            ));
            await updateDoc(classRef, { sportsSessions: currentSessions + 1 });
             //Opdater efter ændring
            if (selectedClass === classId) {
                fetchStudents(classId); // Genindlæs elever (og sportsSessions)
            }

        } catch (error) {

            console.error("Fejl ved opdatering af idrætssessioner:", error);
            alert("Der opstod en fejl. Ændringen blev ikke gemt.");
        }
    };

    const decrementSportsSessions = async (classId, currentSessions) => {
        if (currentSessions <= 0) {
            alert("Antal idrætssessioner kan ikke være mindre end 0.");
            return;
        }
        const newSessions = currentSessions -1
        try {
            const classRef = doc(db, "classes", classId);
             setClasses(classes.map((classItem) =>
                classItem.id === classId ? { ...classItem, sportsSessions: newSessions } : classItem
            ));
            await updateDoc(classRef, { sportsSessions: newSessions });


            if (selectedClass === classId) {
                fetchStudents(classId); //Opdater sportsSessions i state.
            }
        } catch (error) {

            console.error("Fejl ved opdatering af idrætssessioner:", error);
            alert("Der opstod en fejl. Ændringen blev ikke gemt.");
        }
    };

    const openDeleteStudentModal = (studentId) => {
        setStudentToDelete(studentId);
        setIsDeleteModalOpen(true);
    };

    const openDeleteClassModal = (classId) => {
        setClassToDelete(classId);
        setIsDeleteModalOpen(true);
    };


    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setStudentToDelete(null); // Nulstil
        setClassToDelete(null); // Nulstil
    };

    const confirmDeleteStudent = async () => {
        if (!studentToDelete) return;

        try {
            await deleteDoc(doc(db, `classes/${selectedClass}/students`, studentToDelete));
            // Opdater den lokale state *efter* den succesfulde sletning fra Firestore:
            setStudents(students.filter(student => student.id !== studentToDelete));
            closeDeleteModal(); // Luk modalen
        } catch (error) {
            console.error("Fejl ved sletning af elev:", error);
            alert("Der opstod en fejl ved sletning af eleven.");
            closeDeleteModal(); // Luk modalen, selvom der er en fejl
        }
    };

      const confirmDeleteClass = async () => {
        if (!classToDelete) return;

        try {
            // 1. Slet alle elever i klassen (fra subcollection)
            const studentsRef = collection(db, `classes/${classToDelete}/students`);
            const studentSnapshot = await getDocs(studentsRef);

            // Vent på, at *alle* elev-sletninger er færdige:
            await Promise.all(studentSnapshot.docs.map(studentDoc =>
                deleteDoc(doc(db, `classes/${classToDelete}/students`, studentDoc.id))
            ));

            // 2. Slet selve klassen (fra root collection)
            await deleteDoc(doc(db, "classes", classToDelete));

            // 3. Opdater den lokale state (fjern klassen fra listen, og nulstil selectedClass)
            setClasses(classes.filter(classItem => classItem.id !== classToDelete));
            setSelectedClass(null);
            setStudents([]);       // Ryd elever
            closeDeleteModal();    // Luk modalen

        } catch (error) {
            console.error("Fejl ved sletning af klasse:", error);
            alert("Der opstod en fejl under sletningen. Prøv igen."); // Vis fejlmeddelelse
            closeDeleteModal(); // Luk modalen
        }
    };


    return (
        <div className="container">
            <h2 className="heading">Mine Klasser</h2>

            <AddClassForm onAddClass={handleAddClass} />

            {/* Vis loading indikator */}
            {isLoading && <p className="loading">Indlæser...</p>}

            {/* Liste over klasser */}
            <ClassList
                classes={classes}
                selectedClass={selectedClass}
                onClassSelect={fetchStudents}
                user={user}
                showClassInfo={showClassInfo}
                setShowClassInfo={setShowClassInfo}
                onDeleteClass={openDeleteClassModal}
                onIncrementSportsSessions={incrementSportsSessions}
                onDecrementSportsSessions={decrementSportsSessions}
            />


            {/* Elev-sektion */}
            <StudentList
                students={students}
                selectedClass={selectedClass}
                onAddStudent={handleAddStudent}
                onIncrementForgotCount={incrementForgotCount}
                onDecrementForgotCount={decrementForgotCount}
                onDeleteStudent={openDeleteStudentModal}
            />


            <button onClick={handleLogout} className="logoutButton">Log Ud</button>

            {/* Modal til sletning af elev/klasse */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
                <h2>Bekræft Sletning</h2>
                {studentToDelete && <p>Er du sikker på, at du vil slette denne elev?</p>}
                {classToDelete && <p>Er du sikker på at du vil slette denne klasse?</p>}

                <button onClick={studentToDelete ? confirmDeleteStudent : confirmDeleteClass} >Ja, Slet</button> {/* Udfør sletning */}
                <button onClick={closeDeleteModal}>Annuller</button>
            </Modal>

        </div>
    );
};

export default Dashboard;