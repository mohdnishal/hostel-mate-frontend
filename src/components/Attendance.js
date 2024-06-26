import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from './Navbar';

const Loader = () => (
  <div className="loader">
    <span className="loader-text">Loading...</span>
    <span className="load"></span>
  </div>
);
const AttendancePage = () => {
    const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Set initial date to current date
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        axios.get('/api/attendance')
            .then(response => {
                setStudents(response.data);
                const initialAttendance = response.data.map(student => ({
                    studentId: student._id,
                    date: selectedDate,
                    // present: true, // Default all checkboxes as checked
                    absenceStreaks: 0, // Initialize absence streaks
                }));
                setAttendanceData(initialAttendance);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching student data:', error);
                setIsLoading(false);
            });
    }, [selectedDate]);

    const handleDateChange = (e) => {
        const date = new Date(e.target.value);
        const formattedDate = date.toISOString().split('T')[0];
        setSelectedDate(formattedDate);
    };

    const handleAttendanceChange = (studentId, isPresent) => {
        const updatedAttendance = attendanceData.map(item =>
            item.studentId === studentId ? { ...item, present: isPresent } : item
        );

        // Update absence streaks when marking absent
        if (!isPresent) {
            const student = updatedAttendance.find(item => item.studentId === studentId);
            if (student) {
                student.absenceStreaks++; // Increment absence streak
            }
        }

        setAttendanceData(updatedAttendance);
    };

    const handleSubmit = () => {
        setShowConfirmation(true);
    };

    const handleConfirmSubmit = () => {
        setIsLoading(true);
        // Filter out students who are present
        const formattedAttendanceData = attendanceData
            .filter(item => item.present)
            .map(item => item.studentId);

        // Send attendance data including absence streaks to backend
        axios.post('/api/attendance', { date: selectedDate, studentsPresent: formattedAttendanceData })
            .then(response => {
                setIsLoading(false);
                setShowConfirmation(false);
                alert('Attendance saved successfully');
                console.log('Attendance saved successfully:', response.data);
            })
            .catch(error => {
                setIsLoading(false);
                setShowConfirmation(false);
                console.error('Error saving attendance:', error);
            });
    };

    return (
        <>
            <NavBar />
            <div className="container">
                <h1 className="text-center mt-4">Attendance Page</h1>
                <label className="d-block text-center">Select Date:</label>
                <input
                    className="form-control mx-auto"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    style={{ cursor: 'pointer' }}
                />

                <h2 className="text-center mt-4">Students:</h2>
                <table className="table table-bordered table-striped table-lg mx-auto" style={{ width: '80%' }}>
                    <thead>
                        <tr>
                            <th className="text-center">Serial No</th>
                            <th className="text-center">Room No</th>
                            <th className="text-center">Name</th>
                            <th className="text-center">Absent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => (
                            <tr key={student._id}>
                                <td className="text-center">{index + 1}</td>
                                <td className="text-center">{student.Room_No}</td>
                                <td>{student.Name}</td>
                                <td className="text-center">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => handleAttendanceChange(student._id, e.target.checked)}
                                        checked={attendanceData.find(item => item.studentId === student._id)?.present || false}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="text-center">
                    <button className="btn btn-primary" onClick={handleSubmit}>Submit Attendance</button>
                </div>

                {showConfirmation && (
                    <div className="modal-confirms">
                        <div className="modal-contents">
                            <p>Are you sure you want to submit attendance for {selectedDate}?</p>
                            <button className="btn btn-danger me-2" onClick={() => setShowConfirmation(false)}>Cancel</button>
                            <button className="btn btn-success" onClick={handleConfirmSubmit}>Confirm</button>
                        </div>
                    </div>
                )}

                {isLoading && <Loader />}
            </div>
        </>
    );
};
export default AttendancePage;
