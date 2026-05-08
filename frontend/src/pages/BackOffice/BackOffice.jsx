import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BackOffice.css';

// 1. DUMMY DATABASE: Simulating your 'Employee' and 'Role' tables
const initialEmployees = [
  { id: 'EMP-001', name: 'Juan Dela Cruz', role: 'Cashier', salary: '₱500/day', status: 'Active' },
  { id: 'EMP-002', name: 'Maria Santos', role: 'Head Chef', salary: '₱800/day', status: 'Active' },
  { id: 'EMP-003', name: 'Pedro Penduko', role: 'Line Cook', salary: '₱450/day', status: 'On Leave' },
  { id: 'EMP-004', name: 'Ana Reyes', role: 'Delivery Rider', salary: '₱400/day', status: 'Active' },
];

export default function BackOffice() {
  const navigate = useNavigate();
  
  // State for tabs (Staff vs Roles vs Delivery) and employee data
  const [activeTab, setActiveTab] = useState('employees');
  const [employees] = useState(initialEmployees);

  return (
    <div className="admin-container">
      
      {/* LEFT: Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">ServiQ Admin</div>
        
        <nav className="sidebar-nav">
          <button 
            className={`sidebar-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            👥 Staff Management
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            💼 Roles & Wages
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveTab('locations')}
          >
            📍 Delivery Zones
          </button>
        </nav>

        {/* Escape Hatch back to Screen 1 */}
        <button className="back-to-pos-btn" onClick={() => navigate('/')}>
          ← Return to POS
        </button>
      </aside>

      {/* RIGHT: Main Dashboard Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>
            {activeTab === 'employees' && 'Staff Management'}
            {activeTab === 'roles' && 'Roles & Wages'}
            {activeTab === 'locations' && 'Delivery Zones'}
          </h1>
          <button className="add-new-btn">+ Add New Record</button>
        </header>

        {/* Dynamic Content Based on Tab Selection */}
        <div className="dashboard-content">
          
          {activeTab === 'employees' ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Assigned Role</th>
                    <th>Salary Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td><span className="id-badge">{emp.id}</span></td>
                      <td className="emp-name">{emp.name}</td>
                      <td>{emp.role}</td>
                      <td>{emp.salary}</td>
                      <td>
                        <span className={`status-badge ${emp.status === 'Active' ? 'active' : 'inactive'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <button className="edit-btn">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="placeholder-content">
              <h2>🛠️ {activeTab} module is under construction.</h2>
              <p>We are currently scaffolding the employee tables.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}