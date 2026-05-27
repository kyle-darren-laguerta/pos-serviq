import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inventory.css';

export default function WasteItems() {
  const navigate = useNavigate();
  const [wasteItems, setWasteItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchWasteItems = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/inventory/waste`);
        const result = await response.json();

        if (!active) return;

        if (response.ok && result.success) {
          setWasteItems(result.data);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch waste records');
        }
      } catch {
        if (active) {
          setError('Could not connect to the server.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchWasteItems();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="inventory-container">
      <header className="inv-header">
        <div>
          <h1>🗑️ Waste Records</h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
            Viewing waste items recorded from inventory.
          </p>
        </div>
        <button className="back-btn" onClick={() => navigate('/inventory')}>
          ← Back to Inventory
        </button>
      </header>

      <div className="current-stock-panel" style={{ width: '100%' }}>
        {loading ? (
          <p>Loading waste records...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : wasteItems.length === 0 ? (
          <p>No waste records found.</p>
        ) : (
          <div className="waste-list">
            {wasteItems.map((item) => (
              <div key={item.waste_item_id} className="stock-item waste-item">
                <div className="stock-details">
                  <div className="stock-header">
                    <span className="stock-name">{item.ingredient_name}</span>
                    <span className="stock-unit">({item.unit_of_measure})</span>
                  </div>
                  <div className="stock-info-grid">
                    <span className="info-label">Quantity: {item.quantity}</span>
                    <span className="info-label">Reason: {item.reason_category}</span>
                    <span className="info-label">Date: {item.waste_date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
