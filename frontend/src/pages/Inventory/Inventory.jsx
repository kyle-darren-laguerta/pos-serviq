import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryContext } from '../../context/InventoryContext';
import './Inventory.css'; 

export default function Inventory() {
  const navigate = useNavigate();
  const { inventory } = useContext(InventoryContext);

  const [ingredientName, setIngredientName] = useState('');
  const [category, setCategory] = useState('Meat');
  const [stockQty, setStockQty] = useState('');

  const handleSaveIngredient = (e) => {
    e.preventDefault();
    alert(`Dev Note: ${ingredientName} is ready to be sent to the database!`);
    setIngredientName('');
    setStockQty('');
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
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Meat">Meat & Poultry</option>
                <option value="Produce">Produce & Vegetables</option>
                <option value="Dry Goods">Dry Goods & Pantry</option>
                <option value="Beverage">Beverage</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>

            <div>
              <label>Initial Quantity</label>
              <input 
                type="number" 
                placeholder="e.g., 50" 
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="save-btn">Save to Database</button>
          </form>
        </div>

        <div className="current-stock-panel">
          <h3>📊 Current Stock Levels</h3>
          <div style={{ marginTop: '20px' }}>
            {inventory.map((item) => (
              <div key={item.id} className="stock-item">
                <span className="stock-name">{item.item}</span>
                <div className="stock-status">
                  <span className={`stock-qty ${item.stock < 10 ? 'low' : 'good'}`}>
                    {item.stock} in stock
                  </span>
                  <button className="edit-btn">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}