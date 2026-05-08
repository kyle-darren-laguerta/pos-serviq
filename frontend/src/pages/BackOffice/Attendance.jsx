import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Attendance.css';

export default function Attendance() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Tick-tock: Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = (type) => {
    // BACKEND HANDOFF: Darren will replace this with his MySQL INSERT
    const timestamp = currentTime.toLocaleTimeString();
    alert(`DevSync Note: Staff ${type} recorded at ${timestamp}. Handoff to Backend successful.`);
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