import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Attendance.css';

export default function Attendance() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // ---> NEW STATE: Captures the Employee ID
  const [employeeId, setEmployeeId] = useState('');
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceError, setAttendanceError] = useState(null);

  // Tick-tock: Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceLogs = async () => {
    try {
      const response = await fetch('http://localhost:3000/employee/attendance');
      const result = await response.json();
      if (response.ok && result.success) {
        setAttendanceLogs(result.data);
        setAttendanceError(null);
      } else {
        setAttendanceLogs([]);
        setAttendanceError(result.message || 'Unable to load attendance logs');
      }
    } catch (error) {
      console.error('Attendance fetch failed:', error);
      setAttendanceLogs([]);
      setAttendanceError('Unable to connect to the server');
    }
  };

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  const handlePunch = async (type) => {
    // ---> NEW LOGIC: Prevent blank submissions
    if (!employeeId.trim()) {
      alert("⚠️ Please enter your Employee ID first!");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/employee/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_id: employeeId,
          type: type === 'IN' ? 'in' : 'out'
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert(`Employee ${employeeId} ${type === 'IN' ? 'timed in' : 'timed out'} successfully.`);
        fetchAttendanceLogs();
      } else {
        alert(result.message || 'Unable to record attendance');
      }
    } catch (error) {
      console.error('Attendance punch failed:', error);
      alert('Unable to connect to the attendance API');
    }

    setEmployeeId('');
  };

  return (
    <div className="attendance-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🕒 Staff Attendance System</h1>
        <button onClick={() => navigate('/')} className="back-btn" style={{ padding: '8px 16px', cursor: 'pointer' }}>
          ← Exit to POS
        </button>
      </header>

      <div className="attendance-card">
        <h3>Current System Time</h3>
        <div className="live-clock">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <p style={{ color: '#94a3b8' }}>{currentTime.toDateString()}</p>

        {/* ---> NEW UI: Employee ID Input Field <--- */}
        <div style={{ marginTop: '25px', marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Enter Employee ID" 
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            style={{
              padding: '12px 20px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '2px solid #3b82f6',
              backgroundColor: '#0f172a',
              color: 'white',
              textAlign: 'center',
              width: '60%',
              maxWidth: '300px'
            }}
          />
        </div>
        {/* ------------------------------------------- */}

        <div className="btn-group">
          <button className="punch-btn in" onClick={() => handlePunch('IN')}>Time In</button>
          <button className="punch-btn out" onClick={() => handlePunch('OUT')}>Time Out</button>
        </div>
      </div>

      <div className="log-section">
        <h3>Recent Logs</h3>
        {attendanceError && <div className="error-message">{attendanceError}</div>}
        <table className="log-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Employee ID</th>
              <th>Time In</th>
              <th>Time Out</th>
            </tr>
          </thead>
          <tbody>
            {attendanceLogs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '18px 0' }}>
                  No attendance logs available.
                </td>
              </tr>
            ) : (
              attendanceLogs.map((log) => (
                <tr key={log.attendance_id}>
                  <td>{log.full_name}</td>
                  <td>{log.employee_id}</td>
                  <td>{new Date(log.log_in_time).toLocaleString()}</td>
                  <td>{log.log_out_time ? new Date(log.log_out_time).toLocaleString() : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}