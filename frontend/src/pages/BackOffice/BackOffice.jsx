import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuContext } from '../../context/MenuContext';
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
  const [employees, setEmployees] = useState(initialEmployees);
  const [roles, setRoles] = useState([]);
  const [fullName, setFullName] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [employeeError, setEmployeeError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [revenueStartDate, setRevenueStartDate] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return start.toISOString().slice(0, 10);
  });
  const [revenueEndDate, setRevenueEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [revenueData, setRevenueData] = useState([]);
  const [revenueError, setRevenueError] = useState(null);
  const [isRevenueLoading, setIsRevenueLoading] = useState(false);
  const [expensesStartDate, setExpensesStartDate] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return start.toISOString().slice(0, 10);
  });
  const [expensesEndDate, setExpensesEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expensesData, setExpensesData] = useState([]);
  const [expensesError, setExpensesError] = useState(null);
  const [isExpensesLoading, setIsExpensesLoading] = useState(false);
  const [attendanceStartDate, setAttendanceStartDate] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return start.toISOString().slice(0, 10);
  });
  const [attendanceEndDate, setAttendanceEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceError, setAttendanceError] = useState(null);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const modalTitle = activeTab === 'employees'
    ? 'Add New Employee'
    : activeTab === 'packages'
      ? 'Create New Food Package'
      : 'Add New Record';
  
  // Food Package states
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [foodPackages, setFoodPackages] = useState([]);
  const [error, setError] = useState(null);
  const { menuItems } = useContext(MenuContext);

  useEffect(() => {
    fetchFoodPackages();
    fetchEmployees();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchRevenueReport();
    }
  }, [activeTab]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/employee`);
      const result = await response.json();

      if (response.ok && result.success) {
        setEmployees(result.data);
        setEmployeeError(null);
      } else {
        setEmployeeError(result.message || 'Unable to load employees');
      }
    } catch (err) {
      setEmployeeError('Could not connect to the server.');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/employee/roles`);
      const result = await response.json();

      if (response.ok && result.success) {
        setRoles(result.data);
        if (result.data.length > 0) {
          setSelectedRole(result.data[0].role_id);
        }
      }
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!fullName || !hireDate || !contactNumber || !overtimeRate || !selectedRole) {
      setEmployeeError('Please fill in all employee fields.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName,
          hire_date: hireDate,
          contact_number: contactNumber,
          overtime_rate: parseFloat(overtimeRate),
          role_id: selectedRole
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setFullName('');
        setHireDate('');
        setContactNumber('');
        setOvertimeRate('');
        setSelectedRole(roles.length > 0 ? roles[0].role_id : '');
        setEmployeeError(null);
        setIsModalOpen(false);
        fetchEmployees();
      } else {
        setEmployeeError(result.message || 'Failed to add employee');
      }
    } catch (err) {
      console.error('Failed to create employee:', err);
      setEmployeeError('Could not connect to the server.');
    }
  };


  const fetchFoodPackages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/food-package/`);
      const result = await response.json();
      console.log('Food Packages API Response:', response.status, result);
      if (response.ok && result.success) {
        setFoodPackages(result.data);
        setError(null);
      } else {
        const errorMsg = result.message || `Server error: ${response.status}`;
        console.error('Food packages fetch error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Food packages fetch exception:', err);
      setError('Could not connect to the server. Make sure the backend is running.');
    }
  };

  const fetchRevenueReport = async () => {
    setIsRevenueLoading(true);
    setRevenueError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/finance/revenue/${revenueStartDate}/${revenueEndDate}`
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setRevenueData(Array.isArray(result.data) ? result.data : []);
      } else {
        setRevenueData([]);
        setRevenueError(result.message || 'Unable to load revenue report.');
      }
    } catch (err) {
      console.error('Revenue report fetch failed:', err);
      setRevenueData([]);
      setRevenueError('Could not connect to the server.');
    } finally {
      setIsRevenueLoading(false);
    }
  };

  const handleRevenueFilterSubmit = (e) => {
    e.preventDefault();
    fetchRevenueReport();
  };

  const fetchExpensesReport = async () => {
    setIsExpensesLoading(true);
    setExpensesError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/finance/expenses/${revenueStartDate}/${revenueEndDate}`
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setExpensesData(Array.isArray(result.data) ? result.data : []);
      } else {
        setExpensesData([]);
        setExpensesError(result.message || 'Unable to load revenue report.');
      }
    } catch (err) {
      console.error('Revenue report fetch failed:', err);
      setExpensesData([]);
      setExpensesError('Could not connect to the server.');
    } finally {
      setIsExpensesLoading(false);
    }
  };

  const handleExpensesFilterSubmit = (e) => {
    e.preventDefault();
    fetchExpensesReport();
  };

  const fetchAttendanceReport = async () => {
    setIsAttendanceLoading(true);
    setAttendanceError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/employee/attendance-report/${attendanceStartDate}/${attendanceEndDate}`
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setAttendanceData(Array.isArray(result.data) ? result.data : []);
      } else {
        setAttendanceData([]);
        setAttendanceError(result.message || 'Unable to load attendance report.');
      }
    } catch (err) {
      console.error('Attendance report fetch failed:', err);
      setAttendanceData([]);
      setAttendanceError('Could not connect to the server.');
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  const handleAttendanceFilterSubmit = (e) => {
    e.preventDefault();
    fetchAttendanceReport();
  };



  const handleAddMenuItem = () => {
    setSelectedItems([...selectedItems, { menu_item_id: '', quantity: 1 }]);
  };

  const handleRemoveMenuItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleMenuItemChange = (index, menu_item_id) => {
    const updated = [...selectedItems];
    updated[index].menu_item_id = parseInt(menu_item_id);
    setSelectedItems(updated);
  };

  const handleQuantityChange = (index, quantity) => {
    const updated = [...selectedItems];
    updated[index].quantity = parseInt(quantity) || 1;
    setSelectedItems(updated);
  };

  const handleCreateFoodPackage = async (e) => {
    e.preventDefault();
    
    if (!packageName || selectedItems.length === 0) {
      setError('Please enter a package name and add at least one menu item');
      return;
    }

    // Calculate total package price from selected items
    let totalPrice = 0;
    selectedItems.forEach(item => {
      const menuItem = menuItems.find(m => m.menu_item_id === item.menu_item_id);
      if (menuItem) {
        totalPrice += menuItem.price * item.quantity;
      }
    });

    const payload = {
      package_name: packageName,
      total_price: totalPrice,
      items: selectedItems.map(item => ({
        id: item.menu_item_id,
        quantity: item.quantity
      }))
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/food-package/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (response.ok && result.success) {
      const newPackage = {
        id: result.data?.package_id || `PKG-${Date.now()}`,
        package_name: packageName,
        description: packageDescription,
        total_price: totalPrice,
        items: selectedItems.map(item => {
          const menuItem = menuItems.find(m => m.menu_item_id === item.menu_item_id);
          return {
            menu_item_id: item.menu_item_id,
            name: menuItem?.name || 'Unknown',
            quantity: item.quantity,
            itemPrice: menuItem?.price || 0
          };
        })
      };

      setFoodPackages(prev => [...prev, newPackage]);
      setPackageName('');
      setPackageDescription('');
      setPackagePrice('');
      setSelectedItems([]);
      setError(null);
    } else {
      setError(result.message || 'Failed to create food package');
    }
  };

  // CREATE a DELETE query here
  const handleDeletePackage = (packageId) => {
    setFoodPackages(foodPackages.filter(pkg => pkg.id !== packageId));
  };

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
          <button 
            className={`sidebar-btn ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            📦 Food Packages
          </button>
          <button 
            className={`sidebar-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📊 Reports
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
            {activeTab === 'packages' && 'Food Packages'}
            {activeTab === 'reports' && 'Reports'}
          </h1>
          {activeTab !== 'reports' && (
            <button className="add-new-btn" onClick={handleOpenModal}>+ Add New Record</button>
          )}
        </header>

        {/* Dynamic Content Based on Tab Selection */}
        <div className="dashboard-content">
          
          {activeTab === 'employees' ? (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Full Name</th>
                      <th>Role</th>
                      <th>Hire Date</th>
                      <th>Contact</th>
                      <th>Overtime Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.employee_id || emp.id}>
                        <td><span className="id-badge">{emp.employee_id || emp.id}</span></td>
                        <td className="emp-name">{emp.full_name || emp.name}</td>
                        <td>{emp.role_name || emp.role}</td>
                        <td>{emp.hire_date || 'N/A'}</td>
                        <td>{emp.contact_number || 'N/A'}</td>
                        <td>₱{emp.overtime_rate ?? '0.00'}</td>
                        <td>
                          <button className="edit-btn">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : activeTab === 'packages' ? (
            <div className="packages-container">
              {error && <div className="error-message">{error}</div>}
              
              <div className="packages-grid">
                {/* Food Package Creation Form */}
                <div className="add-package-panel">
                  <h3>Create New Food Package</h3>
                  <form onSubmit={handleCreateFoodPackage}>
                    <div>
                      <label>Package Name</label>
                      <input
                        type="text"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        placeholder="e.g., Family Combo"
                        required
                      />
                    </div>

                    <div>
                      <label>Description (Optional)</label>
                      <textarea
                        value={packageDescription}
                        onChange={(e) => setPackageDescription(e.target.value)}
                        placeholder="Describe this package..."
                        rows="3"
                      />
                    </div>

                    <div>
                      <label>Package Price (Optional - auto-calculated if left blank)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={packagePrice}
                        onChange={(e) => setPackagePrice(e.target.value)}
                        placeholder="₱0.00"
                      />
                    </div>

                    <div>
                      <label>📋 Menu Items in Package</label>
                      <div className="menu-items-list">
                        {selectedItems.map((item, index) => (
                          <div key={index} className="menu-item-row">
                            <select
                              value={item.menu_item_id}
                              onChange={(e) => handleMenuItemChange(index, e.target.value)}
                              className="menu-item-select"
                              required
                            >
                              <option value="">Select Menu Item</option>
                              {menuItems.map((menuItem) => (
                                <option key={menuItem.menu_item_id} value={menuItem.menu_item_id}>
                                  {menuItem.name} - ₱{menuItem.price}
                                </option>
                              ))}
                            </select>

                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, e.target.value)}
                              className="quantity-input"
                              placeholder="Qty"
                            />

                            <button
                              type="button"
                              className="remove-item-btn"
                              onClick={() => handleRemoveMenuItem(index)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="add-item-btn"
                        onClick={handleAddMenuItem}
                      >
                        + Add Menu Item
                      </button>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        Save Package
                      </button>
                    </div>
                  </form>
                </div>

                {/* Food Packages List */}
                <div className="packages-list-panel">
                  <h3>Food Packages ({foodPackages.length})</h3>
                  {foodPackages.length === 0 ? (
                    <p className="empty-list">No food packages yet. Create one to get started!</p>
                  ) : (
                    <div className="packages-list">
                      {foodPackages.map((pkg) => (
                        <div key={pkg.package_id} className="package-card">
                          <div className="package-header">
                            <h4>{pkg.package_name}</h4>
                            <span className="package-price">₱{pkg.total_price}</span>
                          </div>
                          {pkg.description && (
                            <p className="package-description">None</p>
                          )}
                          <div className="package-items">
                            <strong>Items:</strong>
                            <ul>
                              {pkg.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.quantity}x {item.name} (₱{item.itemPrice})
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            className="delete-package-btn"
                            onClick={() => handleDeletePackage(pkg.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'reports' ? (
            <div className="reports-container">
              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Revenue Report</h2>
                    <p>Review revenue by interval for completed financial performance.</p>
                  </div>
                  <form className="report-filters" onSubmit={handleRevenueFilterSubmit}>
                    <div className="filter-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={revenueStartDate}
                        onChange={(e) => setRevenueStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="filter-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={revenueEndDate}
                        onChange={(e) => setRevenueEndDate(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="filter-btn">
                      Update
                    </button>
                  </form>
                </div>

                {revenueError && <div className="error-message">{revenueError}</div>}

                <div className="revenue-summary-grid">
                  <div className="report-card">
                    <span>Total Rows</span>
                    <strong>{revenueData.length}</strong>
                  </div>
                  <div className="report-card">
                    <span>Interval</span>
                    <strong>{revenueStartDate} → {revenueEndDate}</strong>
                  </div>
                  <div className="report-card">
                    <span>Status</span>
                    <strong>{isRevenueLoading ? 'Loading...' : 'Ready'}</strong>
                  </div>
                </div>

                <div className="report-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {revenueData.length > 0 ? (
                          Object.keys(revenueData[0]).map((field) => (
                            <th key={field}>{field.replace(/_/g, ' ')}</th>
                          ))
                        ) : (
                          <th>No data available</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {isRevenueLoading ? (
                        <tr>
                          <td colSpan={revenueData[0] ? Object.keys(revenueData[0]).length : 1}>
                            Loading revenue...
                          </td>
                        </tr>
                      ) : revenueData.length > 0 ? (
                        revenueData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, index2) => (
                              <td key={index2}>{value ?? '-'}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={1}>No revenue data found for the selected interval.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Expenses Report</h2>
                    <p>Review revenue by interval for completed financial performance.</p>
                  </div>
                  <form className="report-filters" onSubmit={handleRevenueFilterSubmit}>
                    <div className="filter-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={expensesStartDate}
                        onChange={(e) => setExpensesStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="filter-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={expensesEndDate}
                        onChange={(e) => setExpensesEndDate(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="filter-btn">
                      Update
                    </button>
                  </form>
                </div>

                {revenueError && <div className="error-message">{revenueError}</div>}

                <div className="revenue-summary-grid">
                  <div className="report-card">
                    <span>Total Rows</span>
                    <strong>{revenueData.length}</strong>
                  </div>
                  <div className="report-card">
                    <span>Interval</span>
                    <strong>{expensesStartDate} → {expensesEndDate}</strong>
                  </div>
                  <div className="report-card">
                    <span>Status</span>
                    <strong>{isRevenueLoading ? 'Loading...' : 'Ready'}</strong>
                  </div>
                </div>

                <div className="report-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {revenueData.length > 0 ? (
                          Object.keys(revenueData[0]).map((field) => (
                            <th key={field}>{field.replace(/_/g, ' ')}</th>
                          ))
                        ) : (
                          <th>No data available</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {isRevenueLoading ? (
                        <tr>
                          <td colSpan={revenueData[0] ? Object.keys(revenueData[0]).length : 1}>
                            Loading revenue...
                          </td>
                        </tr>
                      ) : revenueData.length > 0 ? (
                        revenueData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, index2) => (
                              <td key={index2}>{value ?? '-'}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={1}>No revenue data found for the selected interval.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Employee Attendance Records</h2>
                    <p>Review staff attendance and hours worked by date range.</p>
                  </div>
                  <form className="report-filters" onSubmit={handleAttendanceFilterSubmit}>
                    <div className="filter-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={attendanceStartDate}
                        onChange={(e) => setAttendanceStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="filter-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={attendanceEndDate}
                        onChange={(e) => setAttendanceEndDate(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="filter-btn">
                      Update
                    </button>
                  </form>
                </div>

                {attendanceError && <div className="error-message">{attendanceError}</div>}

                <div className="revenue-summary-grid">
                  <div className="report-card">
                    <span>Total Records</span>
                    <strong>{attendanceData.length}</strong>
                  </div>
                  <div className="report-card">
                    <span>Interval</span>
                    <strong>{attendanceStartDate} → {attendanceEndDate}</strong>
                  </div>
                  <div className="report-card">
                    <span>Status</span>
                    <strong>{isAttendanceLoading ? 'Loading...' : 'Ready'}</strong>
                  </div>
                </div>

                <div className="report-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {attendanceData.length > 0 ? (
                          Object.keys(attendanceData[0]).map((field) => (
                            <th key={field}>{field.replace(/_/g, ' ')}</th>
                          ))
                        ) : (
                          <th>No data available</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {isAttendanceLoading ? (
                        <tr>
                          <td colSpan={attendanceData[0] ? Object.keys(attendanceData[0]).length : 1}>
                            Loading attendance records...
                          </td>
                        </tr>
                      ) : attendanceData.length > 0 ? (
                        attendanceData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, index2) => (
                              <td key={index2}>{value ?? '-'}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={1}>No attendance records found for the selected interval.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder-content">
              <h2>🛠️ {activeTab} module is under construction.</h2>
              <p>We are currently scaffolding the employee tables.</p>
            </div>
          )}

        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{modalTitle}</h2>
                  <p className="modal-subtitle">Fill in the fields below and save to add a new record.</p>
                </div>
                <button className="modal-close-btn" onClick={handleCloseModal}>&times;</button>
              </div>

              {activeTab === 'employees' ? (
                <form onSubmit={handleCreateEmployee} className="modal-form">
                  {employeeError && <div className="error-message">{employeeError}</div>}

                  <div className="field-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>Hire Date</label>
                    <input
                      type="date"
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="09123456789"
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>Overtime Rate</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={overtimeRate}
                      onChange={(e) => setOvertimeRate(e.target.value)}
                      placeholder="₱0.00"
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      required
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      Add Employee
                    </button>
                  </div>
                </form>
              ) : (
                <div className="modal-placeholder">
                  {activeTab === 'packages'
                    ? 'Package creation is available in the package panel below.'
                    : 'This tab does not support the modal add form yet.'}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}