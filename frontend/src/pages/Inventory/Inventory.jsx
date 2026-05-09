import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inventory.css'; 

export default function Inventory() {
  const navigate = useNavigate();
  // const { inventory } = useContext(InventoryContext);

  const [name, setName] = useState('');
  const [unitOfMeasurement, setUnitOfMeasurement] = useState('');
  const [minStock, setMinStock] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [editIngredientId, setEditIngredientId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 1. Initialize the inventory state hook
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);

  const clearForm = () => {
    setName('');
    setUnitOfMeasurement('');
    setMinStock('');
    setCostPerUnit('');
    setCurrentStock('');
    setEditIngredientId(null);
    setIsEditMode(false);
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:3000/inventory/ingredient');
      const result = await response.json();

      if (response.ok && result.sucess) {
        setInventory(result.data);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch ingredients");
      }
    } catch (err) {
      setError("Could not connect to the server.");
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleEditIngredient = (item) => {
    setName(item.ingredient_name);
    setUnitOfMeasurement(item.unit_of_measure);
    setMinStock(String(item.minimum_stock_level));
    setCostPerUnit(String(item.cost_per_unit));
    setCurrentStock(String(item.current_stock));
    setEditIngredientId(item.ingredient_id);
    setIsEditMode(true);
  };

  const handleSaveIngredient = async (e) => {
    e.preventDefault();

    const ingredientPayload = {
      ingredient_name: name,
      unit_of_measure: unitOfMeasurement,
      minimum_stock_level: Number(minStock),
      cost_per_unit: parseFloat(costPerUnit),
      current_stock: Number(currentStock),
    };

    const isUpdating = isEditMode && editIngredientId;
    const url = isUpdating
      ? `http://localhost:3000/inventory/ingredient/${editIngredientId}`
      : 'http://localhost:3000/inventory/ingredient';

    try {
      const response = await fetch(url, {
        method: isUpdating ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientPayload),
      });

      const result = await response.json();

      if (response.ok) {
        if (isUpdating) {
          alert('Ingredient updated successfully!');
        } else {
          alert('Ingredient saved successfully!');
        }

        await fetchIngredients();
        clearForm();
      } else {
        alert(`Error: ${result.message || result.error || 'Unable to save ingredient.'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Could not connect to the server.');
    }
  };

  return (
    <div className="inventory-container">
      
      <header className="inv-header">
        <h1>📦 ServiQ Stockroom</h1>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Return to POS
        </button>
      </header>

      <div className="inv-grid">
        
        <div className="add-item-panel">
          <h3>➕ Add New Ingredient</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>Enter new stock items to sync with the database.</p>
          
          <form onSubmit={handleSaveIngredient}>
            <div>
              <label>Ingredient Name</label>
              <input
                type="text"
                placeholder="e.g., Cooking Oil"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Unit of Measurement</label>
              <input
                type="text"
                placeholder="e.g., kg, pcs, L"
                value={unitOfMeasurement}
                onChange={(e) => setUnitOfMeasurement(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Minimum Stock</label>
              <input
                type="number"
                placeholder="e.g., 10"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                min="0"
                required
              />
            </div>

            <div>
              <label>Cost per Unit</label>
              <input
                type="number"
                placeholder="e.g., 3.50"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label>Current Stock</label>
              <input
                type="number"
                placeholder="e.g., 50"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                min="0"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {isEditMode ? 'Update Ingredient' : 'Save to Database'}
              </button>
              {isEditMode && (
                <button type="button" className="cancel-btn" onClick={clearForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="current-stock-panel">
          <h3>📊 Current Stock Levels</h3>
          <div style={{ marginTop: '20px' }}>
            {inventory.map((item) => (
              <div key={item.ingredient_id} className="stock-item">
                <div className="stock-details">
                  <div className="stock-header">
                    <span className="stock-name">{item.ingredient_name}</span>
                    <span className="stock-unit">({item.unit_of_measure})</span>
                  </div>
                  <div className="stock-info-grid">
                    <span className="info-label">Current: <span className={item.current_stock < item.minimum_stock_level ? 'low' : 'good'}>{item.current_stock}</span></span>
                     <span className="info-label">Min: {item.minimum_stock_level}</span>
                    <span className="info-label">Cost: ₱{item.cost_per_unit}</span>
                  </div>
                </div>
                <button className="edit-btn" type="button" onClick={() => handleEditIngredient(item)}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}