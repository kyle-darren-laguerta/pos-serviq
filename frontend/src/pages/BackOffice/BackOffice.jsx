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
  
  // State for tabs (Staff vs Roles) and employee data
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState(initialEmployees);
  const [roles, setRoles] = useState([]);
  const [fullName, setFullName] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [minHoursPerDay, setMinHoursPerDay] = useState('');
  const [maxHoursPerDay, setMaxHoursPerDay] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleWagePerHour, setRoleWagePerHour] = useState('');
  const [roleWagePerMonth, setRoleWagePerMonth] = useState('');
  const [employeeError, setEmployeeError] = useState(null);
  const [roleError, setRoleError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [customerError, setCustomerError] = useState(null);
  const [locationZones, setLocationZones] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [locationNameInput, setLocationNameInput] = useState('');
  const [deliveryRateInput, setDeliveryRateInput] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerContactInput, setCustomerContactInput] = useState('');
  const [customerZoneId, setCustomerZoneId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);

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
  const [partTimeSalaryStartDate, setPartTimeSalaryStartDate] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return start.toISOString().slice(0, 10);
  });
  const [partTimeSalaryEndDate, setPartTimeSalaryEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [partTimeSalaryData, setPartTimeSalaryData] = useState([]);
  const [partTimeSalaryError, setPartTimeSalaryError] = useState(null);
  const [isPartTimeSalaryLoading, setIsPartTimeSalaryLoading] = useState(false);
  const [monthlyItemSoldStartDate, setMonthlyItemSoldStartDate] = useState(() => {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return start.toISOString().slice(0, 10);
  });
  const [monthlyItemSoldEndDate, setMonthlyItemSoldEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [monthlyItemSoldData, setMonthlyItemSoldData] = useState([]);
  const [monthlyItemSoldError, setMonthlyItemSoldError] = useState(null);
  const [isMonthlyItemSoldLoading, setIsMonthlyItemSoldLoading] = useState(false);

  const handleOpenModal = () => {
    // clear editing state when opening a generic add modal
    setEditingRoleId(null);
    setRoleName('');
    setRoleWagePerHour('');
    setRoleWagePerMonth('');
    setFullName('');
    setHireDate('');
    setContactNumber('');
    setOvertimeRate('');
    setSelectedRole('');
    setEmploymentType('');
    setMinHoursPerDay('');
    setMaxHoursPerDay('');
    setEmployeeError(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setEditingRoleId(null);
    setEmploymentType('');
    setMinHoursPerDay('');
    setMaxHoursPerDay('');
    setIsModalOpen(false);
  };

  const modalTitle = activeTab === 'employees'
    ? 'Add New Employee'
    : activeTab === 'roles'
      ? 'Add New Role'
      : 'Add New Record';
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const { menuItems } = useContext(MenuContext);

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
    fetchLocationZones();
    fetchCustomers();
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

  const fetchLocationZones = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/location-zone`);
      const result = await response.json();

      if (response.ok && result.success) {
        setLocationZones(result.data);
        setLocationError(null);
      } else {
        setLocationError(result.message || 'Unable to load location zones');
      }
    } catch (err) {
      console.error('Failed to load location zones:', err);
      setLocationError('Could not connect to the server.');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/customer`);
      const result = await response.json();

      if (response.ok && result.success) {
        setCustomers(result.data);
        setCustomerError(null);
      } else {
        setCustomerError(result.message || 'Unable to load customers');
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setCustomerError('Could not connect to the server.');
    }
  };

  const handleCreateLocationZone = async (e) => {
    e.preventDefault();
    if (!locationNameInput || deliveryRateInput === '') {
      setLocationError('Please enter a location and delivery rate.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/location-zone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_name: locationNameInput,
          delivery_rate: parseFloat(deliveryRateInput)
        })
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setLocationNameInput('');
        setDeliveryRateInput('');
        setLocationError(null);
        fetchLocationZones();
      } else {
        setLocationError(result.message || 'Failed to add location zone');
      }
    } catch (err) {
      console.error('Failed to create location zone:', err);
      setLocationError('Could not connect to the server.');
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!customerNameInput || !customerZoneId) {
      setCustomerError('Please enter a customer name and select a zone.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: customerNameInput,
          contact_number: customerContactInput || null,
          location_zone_id: parseInt(customerZoneId, 10)
        })
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setCustomerNameInput('');
        setCustomerContactInput('');
        setCustomerZoneId('');
        setCustomerError(null);
        fetchCustomers();
      } else {
        setCustomerError(result.error || 'Failed to add customer');
      }
    } catch (err) {
      console.error('Failed to create customer:', err);
      setCustomerError('Could not connect to the server.');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!fullName || !hireDate || !contactNumber || !overtimeRate || !selectedRole || !employmentType) {
      setEmployeeError('Please fill in all employee fields including employment type.');
      return;
    }

    if (employmentType === 'full-time' && !minHoursPerDay) {
      setEmployeeError('Please fill in minimum hours per day for full-time employees.');
      return;
    }

    if (employmentType === 'part-time' && !maxHoursPerDay) {
      setEmployeeError('Please fill in maximum hours per day for part-time employees.');
      return;
    }

    try {
      // Step 1: Create employee record with employment type
      const employeeResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: fullName,
          hire_date: hireDate,
          contact_number: contactNumber,
          overtime_rate: parseFloat(overtimeRate),
          role_id: selectedRole,
          type: employmentType
        })
      });

      const employeeResult = await employeeResponse.json();
      if (!employeeResponse.ok || !employeeResult.success) {
        setEmployeeError(employeeResult.message || 'Failed to add employee');
        return;
      }

      // Step 2: Create employment type specific record
      const employeeId = employeeResult.data.employee_id;
      const employmentTypeEndpoint = employmentType === 'full-time' 
        ? `${import.meta.env.VITE_BACKEND_URL}/employee/full-time`
        : `${import.meta.env.VITE_BACKEND_URL}/employee/part-time`;

      const employmentTypePayload = employmentType === 'full-time'
        ? {
            employee_id: employeeId,
            min_hours_per_day: parseInt(minHoursPerDay)
          }
        : {
            employee_id: employeeId,
            max_hours_per_day: parseInt(maxHoursPerDay)
          };

      const employmentTypeResponse = await fetch(employmentTypeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employmentTypePayload)
      });

      const employmentTypeResult = await employmentTypeResponse.json();
      if (!employmentTypeResponse.ok || !employmentTypeResult.success) {
        setEmployeeError(employmentTypeResult.message || `Failed to set ${employmentType} employment type`);
        return;
      }

      // Step 3: Clear form and close modal
      setFullName('');
      setHireDate('');
      setContactNumber('');
      setOvertimeRate('');
      setSelectedRole(roles.length > 0 ? roles[0].role_id : '');
      setEmploymentType('');
      setMinHoursPerDay('');
      setMaxHoursPerDay('');
      setEmployeeError(null);
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to create employee:', err);
      setEmployeeError('Could not connect to the server.');
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!roleName || roleWagePerHour === '' || roleWagePerMonth === '') {
      setRoleError('Please fill in all role fields.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/employee/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role_name: roleName,
          wage_per_hour: parseFloat(roleWagePerHour),
          wage_per_month: parseFloat(roleWagePerMonth)
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setRoleName('');
        setRoleWagePerHour('');
        setRoleWagePerMonth('');
        setRoleError(null);
        setIsModalOpen(false);
        fetchRoles();
      } else {
        setRoleError(result.message || 'Failed to add role');
      }
    } catch (err) {
      console.error('Failed to create role:', err);
      setRoleError('Could not connect to the server.');
    }
  };

  const handleEditRole = (role) => {
    setEditingRoleId(role.role_id);
    setRoleName(role.role_name || '');
    setRoleWagePerHour(role.wage_per_hour ?? '');
    setRoleWagePerMonth(role.wage_per_month ?? '');
    setRoleError(null);
    setIsModalOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingRoleId) return;
    if (!roleName || roleWagePerHour === '' || roleWagePerMonth === '') {
      setRoleError('Please fill in all role fields.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/employee/roles/${editingRoleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role_name: roleName,
          wage_per_hour: parseFloat(roleWagePerHour),
          wage_per_month: parseFloat(roleWagePerMonth)
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setEditingRoleId(null);
        setRoleName('');
        setRoleWagePerHour('');
        setRoleWagePerMonth('');
        setRoleError(null);
        setIsModalOpen(false);
        fetchRoles();
      } else {
        setRoleError(result.message || 'Failed to update role');
      }
    } catch (err) {
      console.error('Failed to update role:', err);
      setRoleError('Could not connect to the server.');
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
        `${import.meta.env.VITE_BACKEND_URL}/finance/expenses/${expensesStartDate}/${expensesEndDate}`
      );
      const result = await response.json();

      if (response.ok && result.success) {
        const expensesPayload = result.data;
        setExpensesData(Array.isArray(expensesPayload) ? expensesPayload : [expensesPayload]);
      } else {
        setExpensesData([]);
        setExpensesError(result.message || 'Unable to load expenses report.');
      }
    } catch (err) {
      console.error('Expenses report fetch failed:', err);
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

  const fetchPartTimeSalaryReport = async () => {
    setIsPartTimeSalaryLoading(true);
    setPartTimeSalaryError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/finance/parttime-salary/${partTimeSalaryStartDate}/${partTimeSalaryEndDate}`
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setPartTimeSalaryData(Array.isArray(result.data) ? result.data : []);
      } else {
        setPartTimeSalaryData([]);
        setPartTimeSalaryError(result.message || 'Unable to load part-time salary report.');
      }
    } catch (err) {
      console.error('Part-time salary report fetch failed:', err);
      setPartTimeSalaryData([]);
      setPartTimeSalaryError('Could not connect to the server.');
    } finally {
      setIsPartTimeSalaryLoading(false);
    }
  };

  const handlePartTimeSalaryFilterSubmit = (e) => {
    e.preventDefault();
    fetchPartTimeSalaryReport();
  };

  const fetchMonthlyItemSoldReport = async () => {
    setIsMonthlyItemSoldLoading(true);
    setMonthlyItemSoldError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/finance/monthly-item-sold/${monthlyItemSoldStartDate}/${monthlyItemSoldEndDate}`
      );
      const result = await response.json();

      if (response.ok && result.success) {
        setMonthlyItemSoldData(Array.isArray(result.data) ? result.data : []);
      } else {
        setMonthlyItemSoldData([]);
        setMonthlyItemSoldError(result.message || 'Unable to load item sold report.');
      }
    } catch (err) {
      console.error('Monthly item sold report fetch failed:', err);
      setMonthlyItemSoldData([]);
      setMonthlyItemSoldError('Could not connect to the server.');
    } finally {
      setIsMonthlyItemSoldLoading(false);
    }
  };

  const handleMonthlyItemSoldFilterSubmit = (e) => {
    e.preventDefault();
    fetchMonthlyItemSoldReport();
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
            className={`sidebar-btn ${activeTab === 'zones' ? 'active' : ''}`}
            onClick={() => setActiveTab('zones')}
          >
            📍 Locations & Customers
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
            {activeTab === 'zones' && 'Locations & Customers'}
            {activeTab === 'reports' && 'Reports'}
          </h1>
          {activeTab !== 'reports' && activeTab !== 'zones' && (
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
          ) : activeTab === 'roles' ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Role ID</th>
                    <th>Role Name</th>
                    <th>Wage Per Hour</th>
                    <th>Wage Per Month</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.role_id}>
                      <td><span className="id-badge">{role.role_id}</span></td>
                      <td>{role.role_name}</td>
                      <td>₱{role.wage_per_hour ?? '0.00'}</td>
                      <td>₱{role.wage_per_month ?? '0.00'}</td>
                      <td>
                        <button className="edit-btn" onClick={() => handleEditRole(role)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'zones' ? (
            <div className="zones-customers-container">
              <div className="zones-customers-panel">
                <div className="panel-block">
                  <h3>Create New Location Zone</h3>
                  {locationError && <p className="error-text">{locationError}</p>}
                  <form onSubmit={handleCreateLocationZone} className="zone-form">
                    <div>
                      <label className="form-label">Location Name</label>
                      <input
                        className="form-input"
                        type="text"
                        value={locationNameInput}
                        onChange={(e) => setLocationNameInput(e.target.value)}
                        placeholder="e.g., Daraga"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Delivery Rate</label>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={deliveryRateInput}
                        onChange={(e) => setDeliveryRateInput(e.target.value)}
                        placeholder="₱0.00"
                        required
                      />
                    </div>
                    <button type="submit" className="save-btn">Save Location Zone</button>
                  </form>
                </div>

                <div className="panel-block">
                  <h3>Add New Customer</h3>
                  {customerError && <p className="error-text">{customerError}</p>}
                  <form onSubmit={handleCreateCustomer} className="customer-form">
                    <div>
                      <label className="form-label">Customer Name</label>
                      <input
                        className="form-input"
                        
                        type="text"
                        value={customerNameInput}
                        onChange={(e) => setCustomerNameInput(e.target.value)}
                        placeholder="e.g., Juan Dela Cruz"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Contact Number</label>
                      <input
                        className="form-input"
                        type="text"
                        value={customerContactInput}
                        onChange={(e) => setCustomerContactInput(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="form-label">Location Zone</label>
                      <select
                        className="form-input"
                        value={customerZoneId}
                        onChange={(e) => setCustomerZoneId(e.target.value)}
                        required
                      >
                        <option value="">Select zone</option>
                        {locationZones.map((zone) => (
                          <option key={zone.location_zone_id} value={zone.location_zone_id}>
                            {zone.location_name} (₱{zone.delivery_rate})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="save-btn">Save Customer</button>
                  </form>
                </div>
              </div>

              <div className="zones-customers-list">
                <div className="table-wrapper">
                  <h3>Location Zones</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Delivery Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationZones.map((zone) => (
                        <tr key={zone.location_zone_id}>
                          <td><span className="id-badge">{zone.location_zone_id}</span></td>
                          <td>{zone.location_name}</td>
                          <td>₱{parseFloat(zone.delivery_rate).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="table-wrapper">
                  <h3>Customers</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Zone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.person_id}>
                          <td><span className="id-badge">{customer.person_id}</span></td>
                          <td>{customer.full_name}</td>
                          <td>{customer.contact_number || 'N/A'}</td>
                          <td>{customer.location_name || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <form className="report-filters" onSubmit={handleExpensesFilterSubmit}>
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

                {expensesError && <div className="error-message">{expensesError}</div>}

                <div className="revenue-summary-grid">
                  <div className="report-card">
                    <span>Total Rows</span>
                    <strong>{expensesData.length}</strong>
                  </div>
                  <div className="report-card">
                    <span>Interval</span>
                    <strong>{expensesStartDate} → {expensesEndDate}</strong>
                  </div>
                  <div className="report-card">
                    <span>Status</span>
                    <strong>{isExpensesLoading ? 'Loading...' : 'Ready'}</strong>
                  </div>
                </div>

                <div className="report-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {expensesData.length > 0 ? (
                          Object.keys(expensesData[0]).map((field) => (
                            <th key={field}>{field.replace(/_/g, ' ')}</th>
                          ))
                        ) : (
                          <th>No data available</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {isExpensesLoading ? (
                        <tr>
                          <td colSpan={expensesData[0] ? Object.keys(expensesData[0]).length : 1}>
                            Loading expenses...
                          </td>
                        </tr>
                      ) : expensesData.length > 0 ? (
                        expensesData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, index2) => (
                              <td key={index2}>{value ?? '-'}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={1}>No expenses data found for the selected interval.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Full Time Employee Attendance Records</h2>
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

              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Part Time Employee Salary Report</h2>
                    <p>Review part-time employee expected salary based on hours worked.</p>
                  </div>
                  <form className="report-filters" onSubmit={handlePartTimeSalaryFilterSubmit}>
                    <div className="filter-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={partTimeSalaryStartDate}
                        onChange={(e) => setPartTimeSalaryStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="filter-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={partTimeSalaryEndDate}
                        onChange={(e) => setPartTimeSalaryEndDate(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="filter-btn">
                      Update
                    </button>
                  </form>
                </div>

                {partTimeSalaryError && <div className="error-message">{partTimeSalaryError}</div>}

                <div className="revenue-summary-grid">
                  <div className="report-card">
                    <span>Total Employees</span>
                    <strong>{partTimeSalaryData.length}</strong>
                  </div>
                  <div className="report-card">
                    <span>Interval</span>
                    <strong>{partTimeSalaryStartDate} → {partTimeSalaryEndDate}</strong>
                  </div>
                  <div className="report-card">
                    <span>Status</span>
                    <strong>{isPartTimeSalaryLoading ? 'Loading...' : 'Ready'}</strong>
                  </div>
                </div>

                <div className="report-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {partTimeSalaryData.length > 0 ? (
                          Object.keys(partTimeSalaryData[0]).map((field) => (
                            <th key={field}>{field.replace(/_/g, ' ')}</th>
                          ))
                        ) : (
                          <th>No data available</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {isPartTimeSalaryLoading ? (
                        <tr>
                          <td colSpan={partTimeSalaryData[0] ? Object.keys(partTimeSalaryData[0]).length : 1}>
                            Loading salary records...
                          </td>
                        </tr>
                      ) : partTimeSalaryData.length > 0 ? (
                        partTimeSalaryData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, index2) => (
                              <td key={index2}>{value ?? '-'}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={1}>No part-time salary records found for the selected interval.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="report-section">
                <div className="report-section-header">
                  <div>
                    <h2>Menu Items Sold Report</h2>
                    <p>Review item sales quantity for the selected date interval.</p>
                  </div>
                  <form className="report-filters" onSubmit={handleMonthlyItemSoldFilterSubmit}>
                    <div className="filter-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={monthlyItemSoldStartDate}
                        onChange={(e) => setMonthlyItemSoldStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="filter-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={monthlyItemSoldEndDate}
                        onChange={(e) => setMonthlyItemSoldEndDate(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="filter-btn">
                      Update
                    </button>
                  </form>
                </div>

                {monthlyItemSoldError && <div className="error-message">{monthlyItemSoldError}</div>}

                <div className="revenue-summary-grid">
                  <div className="report-card">
                    <span>Total Items</span>
                    <strong>{monthlyItemSoldData.length}</strong>
                  </div>
                  <div className="report-card">
                    <span>Interval</span>
                    <strong>{monthlyItemSoldStartDate} → {monthlyItemSoldEndDate}</strong>
                  </div>
                  <div className="report-card">
                    <span>Status</span>
                    <strong>{isMonthlyItemSoldLoading ? 'Loading...' : 'Ready'}</strong>
                  </div>
                </div>

                <div className="report-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {monthlyItemSoldData.length > 0 ? (
                          Object.keys(monthlyItemSoldData[0]).map((field) => (
                            <th key={field}>{field.replace(/_/g, ' ')}</th>
                          ))
                        ) : (
                          <th>No data available</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {isMonthlyItemSoldLoading ? (
                        <tr>
                          <td colSpan={monthlyItemSoldData[0] ? Object.keys(monthlyItemSoldData[0]).length : 1}>
                            Loading item sales...
                          </td>
                        </tr>
                      ) : monthlyItemSoldData.length > 0 ? (
                        monthlyItemSoldData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, index2) => (
                              <td key={index2}>{value ?? '-'}</td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={1}>No item sales found for the selected interval.</td>
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

                  <div className="field-group">
                    <label>Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      required
                    >
                      <option value="">Select employment type</option>
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                    </select>
                  </div>

                  {employmentType === 'full-time' && (
                    <div className="field-group">
                      <label>Minimum Hours Per Day</label>
                      <input
                        type="number"
                        min="1"
                        value={minHoursPerDay}
                        onChange={(e) => setMinHoursPerDay(e.target.value)}
                        placeholder="e.g., 8"
                        required
                      />
                    </div>
                  )}

                  {employmentType === 'part-time' && (
                    <div className="field-group">
                      <label>Maximum Hours Per Day</label>
                      <input
                        type="number"
                        min="1"
                        value={maxHoursPerDay}
                        onChange={(e) => setMaxHoursPerDay(e.target.value)}
                        placeholder="e.g., 6"
                        required
                      />
                    </div>
                  )}

                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      Add Employee
                    </button>
                  </div>
                </form>
              ) : activeTab === 'roles' ? (
                <form onSubmit={editingRoleId ? handleUpdateRole : handleCreateRole} className="modal-form">
                  {roleError && <div className="error-message">{roleError}</div>}

                  <div className="field-group">
                    <label>Role Name</label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="Cashier"
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>Wage Per Hour</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={roleWagePerHour}
                      onChange={(e) => setRoleWagePerHour(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label>Wage Per Month</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={roleWagePerMonth}
                      onChange={(e) => setRoleWagePerMonth(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      {editingRoleId ? 'Update Role' : 'Add Role'}
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