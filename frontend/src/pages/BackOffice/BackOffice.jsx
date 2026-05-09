import React, { useState, useEffect } from 'react';
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
  
  // Food Package states
  const [packageName, setPackageName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [foodPackages, setFoodPackages] = useState([]);
  const [error, setError] = useState(null);

  // Fetch menu items on component mount
  useEffect(() => {
    fetchMenuItems();
    fetchFoodPackages();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/menu/item');
      const result = await response.json();
      if (response.ok && result.success) {
        setMenuItems(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch menu items');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    }
  };

  const fetchFoodPackages = async () => {
    try {
      const response = await fetch('http://localhost:3000/food-package/');
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
        packageName,
        items: selectedItems.map(item => ({
          id: item.menu_item_id,       // ✅ maps to what the backend expects
          quantity: item.quantity
        }))
      };

      const response = await fetch('http://localhost:3000/menu/package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

    const newPackage = {
      id: `PKG-${Date.now()}`,
      name: packageName,
      description: packageDescription,
      price: packagePrice || totalPrice,
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

    setPackageName('');
    setPackageDescription('');
    setPackagePrice('');
    setSelectedItems([]);
    setError(null);
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
            className="sidebar-btn"
            onClick={() => navigate('/manage-menu')}
          >
            🍽️ Manage Menu
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