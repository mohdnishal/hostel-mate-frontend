import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Set initial date to current date
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    axios.get('/attendance')
      .then(response => {
        setStudents(response.data);
        const initialAttendance = response.data.map(student => ({
          studentId: student._id,
          date: selectedDate,
          present: true, // Default all checkboxes as checked
        }));
        setAttendanceData(initialAttendance);
      })
      .catch(error => {
        console.error('Error fetching student data:', error);
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
    setAttendanceData(updatedAttendance);
  };

  const handleSubmit = () => {
    if (!attendanceData.some(item => item.present)) {
      alert('Please mark attendance for at least one student.');
      return;
    }
  
    const formattedAttendanceData = attendanceData
      .filter(item => item.present) // Filter out students who are not present
      .map(item => item.studentId); // Map to an array of student IDs
  
    axios.post('/attendance', { date: selectedDate, studentsPresent: formattedAttendanceData })
      .then(response => {
        alert('Attendance saved successfully');
        console.log('Attendance saved successfully:', response.data);
      })
      .catch(error => {
        console.error('Error saving attendance:', error);
      });
  };
  
  return (
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
            <th className="text-center">Present</th>
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
    </div>
  );
};

export default AttendancePage;