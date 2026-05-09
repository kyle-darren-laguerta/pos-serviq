import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Attendance.css';

export default function Attendance() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // ---> NEW STATE: Captures the Employee ID
  const [employeeId, setEmployeeId] = useState('');

  // Tick-tock: Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = (type) => {
    // ---> NEW LOGIC: Prevent blank submissions
    if (!employeeId.trim()) {
      alert("⚠️ Please enter your Employee ID first!");
      return;
    }

    const timestamp = currentTime.toLocaleTimeString();
    
    // BACKEND HANDOFF: Darren will replace this with his MySQL INSERT
    alert(`DevSync Note: Employee ID [${employeeId}] recorded ${type} at ${timestamp}. Handoff to Backend successful.`);
    
    // Clear the input field for the next person
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
        <table className="log-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Joeven Gatuteo</td>
              <td><span style={{ color: '#10b981' }}>Shift Started</span></td>
              <td>08:00 AM</td>
            </tr>
            <tr>
              <td>Kyle Darren</td>
              <td><span style={{ color: '#ef4444' }}>Shift Ended</span></td>
              <td>05:00 PM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}