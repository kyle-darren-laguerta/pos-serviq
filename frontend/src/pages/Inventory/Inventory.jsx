import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inventory.css';

// 1. DUMMY DATABASE: Simulating 'Ingredient' and 'Waste_Item' tables
const initialIngredients = [
  { id: 'ING-001', name: 'Marinated Beef Tapa', unit: 'kg', cost: '₱350', stock: 15, minStock: 10 },
  { id: 'ING-002', name: 'Fresh Eggs', unit: 'pcs', cost: '₱8', stock: 24, minStock: 50 }, // Low Stock!
  { id: 'ING-003', name: 'Garlic Rice', unit: 'kg', cost: '₱60', stock: 20, minStock: 15 },
  { id: 'ING-004', name: 'Cooking Oil', unit: 'L', cost: '₱120', stock: 3, minStock: 5 }, // Low Stock!
];

const initialWasteLogs = [
  { id: 'WST-001', date: '2026-04-28', item: 'Fresh Eggs', quantity: '3 pcs', reason: 'Dropped/Broken', loggedBy: 'Juan D.' },
  { id: 'WST-002', date: '2026-04-29', item: 'Garlic Rice', quantity: '0.5 kg', reason: 'End of Day Spoilage', loggedBy: 'Maria S.' },
];

export default function Inventory() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('stock');
  const [ingredients] = useState(initialIngredients);
  const [wasteLogs] = useState(initialWasteLogs);

  return (
    <div className="inventory-container">
      
      {/* LEFT: Sidebar Navigation (Consistent with Admin) */}
      <aside className="inv-sidebar">
        <div className="inv-logo">ServiQ Back-of-House</div>
        
        <nav className="inv-nav">
          <button 
            className={`inv-nav-btn ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            📦 Raw Ingredients
          </button>
          <button 
            className={`inv-nav-btn ${activeTab === 'waste' ? 'active' : ''}`}
            onClick={() => setActiveTab('waste')}
          >
            🗑️ Spoilage & Waste Log
          </button>
          <button 
            className={`inv-nav-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
          >
            🚚 Supplier Directory
          </button>
        </nav>

        <button className="back-btn" onClick={() => navigate('/')}>
          ← Return to POS
        </button>
      </aside>

      {/* RIGHT: Main Dashboard Content */}
      <main className="inv-main">
        <header className="inv-header">
          <h1>
            {activeTab === 'stock' && 'Stock Level Monitor'}
            {activeTab === 'waste' && 'Waste & Spoilage Logs'}
            {activeTab === 'suppliers' && 'Supplier Directory'}
          </h1>
          
          {/* Dynamic Action Button */}
          {activeTab === 'stock' && <button className="action-btn restock-btn">Receive Delivery</button>}
          {activeTab === 'waste' && <button className="action-btn log-waste-btn">Log New Waste</button>}
        </header>

        <div className="inv-content">
          
          {/* STOCK MONITOR TAB */}
          {activeTab === 'stock' && (
            <div className="table-card">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Ingredient Name</th>
                    <th>Cost / Unit</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((item) => {
                    // Logic to check if stock is dangerously low
                    const isLowStock = item.stock < item.minStock;
                    
                    return (
                      <tr key={item.id} className={isLowStock ? 'low-stock-row' : ''}>
                        <td><span className="code-badge">{item.id}</span></td>
                        <td className="item-name">{item.name}</td>
                        <td>{item.cost} / {item.unit}</td>
                        <td className="stock-qty">
                          {item.stock} {item.unit}
                          <span className="min-label">(Min: {item.minStock})</span>
                        </td>
                        <td>
                          {isLowStock ? (
                            <span className="status-pill danger">Low Stock</span>
                          ) : (
                            <span className="status-pill safe">Healthy</span>
                          )}
                        </td>
                        <td><button className="text-btn">Adjust</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* WASTE LOG TAB */}
          {activeTab === 'waste' && (
            <div className="table-card">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Date</th>
                    <th>Item Wasted</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>Logged By</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteLogs.map((log) => (
                    <tr key={log.id}>
                      <td><span className="code-badge">{log.id}</span></td>
                      <td>{log.date}</td>
                      <td className="item-name">{log.item}</td>
                      <td className="waste-qty">{log.quantity}</td>
                      <td className="reason-text">{log.reason}</td>
                      <td>{log.loggedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SUPPLIERS TAB */}
          {activeTab === 'suppliers' && (
            <div className="placeholder-box">
              <h2>Supplier Module</h2>
              <p>Database connection required to load supplier contacts.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}