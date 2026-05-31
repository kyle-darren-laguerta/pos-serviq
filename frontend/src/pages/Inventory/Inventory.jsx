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
  const [newIngredientSupplierId, setNewIngredientSupplierId] = useState('');
  const [newIngredientDateSupplied, setNewIngredientDateSupplied] = useState(new Date().toISOString().split('T')[0]);
  const [editIngredientId, setEditIngredientId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [wasteIngredientId, setWasteIngredientId] = useState(null);
  const [wasteQuantity, setWasteQuantity] = useState('');
  const [wasteReason, setWasteReason] = useState('');
  const [wasteDate, setWasteDate] = useState(new Date().toISOString().split('T')[0]);

  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [supplierIngredients, setSupplierIngredients] = useState([]);
  const [supplierError, setSupplierError] = useState(null);

  const [supplyIngredientId, setSupplyIngredientId] = useState(null);
  const [supplyQuantity, setSupplyQuantity] = useState('');
  const [supplyPrice, setSupplyPrice] = useState('');
  const [supplySupplierId, setSupplySupplierId] = useState('');
  const [supplyDate, setSupplyDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplyError, setSupplyError] = useState(null);

  // 1. Initialize the inventory state hook
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);

  const clearForm = () => {
    setName('');
    setUnitOfMeasurement('');
    setMinStock('');
    setCostPerUnit('');
    setCurrentStock('');
    setNewIngredientSupplierId('');
    setNewIngredientDateSupplied(new Date().toISOString().split('T')[0]);
    setEditIngredientId(null);
    setIsEditMode(false);
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/inventory/ingredient`);
      const result = await response.json();

      if (response.ok && result.success) {
        setInventory(result.data);
        setError(null);
      } else {
        setError(result.message || "Failed to fetch ingredients");
      }
    } catch {
      setError("Could not connect to the server.");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/inventory/supplier`);
      const result = await response.json();

      if (response.ok && result.success) {
        setSuppliers(result.data);
        setSupplierError(null);
      } else {
        setSupplierError(result.message || "Failed to fetch suppliers");
      }
    } catch {
      setSupplierError("Could not connect to the server.");
    }
  };

  const fetchSupplierIngredients = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/inventory/supplier-ingredient`);
      const result = await response.json();

      if (response.ok && result.success) {
        setSupplierIngredients(result.data);
      }
    } catch {
      // Silent fallback, supplier ingredient panel can remain empty
    }
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (!active) return;
      await Promise.all([fetchIngredients(), fetchSuppliers(), fetchSupplierIngredients()]);
    };

    loadData();
    return () => {
      active = false;
    };
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
      supplier_id: newIngredientSupplierId ? Number(newIngredientSupplierId) : undefined,
      date_supplied: newIngredientDateSupplied,
    };

    const isUpdating = isEditMode && editIngredientId;
    const url = isUpdating
      ? `${import.meta.env.VITE_BACKEND_URL}/inventory/ingredient/${editIngredientId}`
      : `${import.meta.env.VITE_BACKEND_URL}/inventory/ingredient`;

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

  const clearSupplierForm = () => {
    setSupplierName('');
    setSupplierContact('');
    setSupplierAddress('');
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();

    const payload = {
      supplier_name: supplierName,
      contact_number: supplierContact,
      supplier_address: supplierAddress,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/inventory/supplier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Supplier added successfully!');
        await fetchSuppliers();
        clearSupplierForm();
      } else {
        alert(`Error: ${result.message || result.error || 'Unable to save supplier.'}`);
      }
    } catch (error) {
      console.error('Supplier submission error:', error);
      alert('Could not connect to the server.');
    }
  };

  const clearSupplyForm = () => {
    setSupplyIngredientId(null);
    setSupplyQuantity('');
    setSupplyPrice('');
    setSupplySupplierId('');
    setSupplyDate(new Date().toISOString().split('T')[0]);
    setSupplyError(null);
  };

  const openSupplyForm = (item) => {
    if (supplyIngredientId === item.ingredient_id) {
      clearSupplyForm();
      return;
    }

    setSupplyIngredientId(item.ingredient_id);
    setSupplyQuantity('');
    setSupplyPrice('');
    setSupplySupplierId('');
    setSupplyDate(new Date().toISOString().split('T')[0]);
    setSupplyError(null);
  };

  const handleSupplySubmit = async (e) => {
    e.preventDefault();

    if (!supplyIngredientId) {
      return;
    }

    const payload = {
      supplier_id: Number(supplySupplierId),
      ingredient_id: supplyIngredientId,
      quantity: Number(supplyQuantity),
      supplied_price: Number(supplyPrice),
      date_supplied: supplyDate,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/inventory/supplier-ingredient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('Supply recorded successfully!');
        await fetchIngredients();
        await fetchSupplierIngredients();
        clearSupplyForm();
      } else {
        setSupplyError(result.message || result.error || 'Unable to record supply.');
      }
    } catch (error) {
      console.error('Supply submission error:', error);
      setSupplyError('Could not connect to the server.');
    }
  };

  const openWasteForm = (item) => {
    if (wasteIngredientId === item.ingredient_id) {
      setWasteIngredientId(null);
      return;
    }

    setWasteIngredientId(item.ingredient_id);
    setWasteQuantity('');
    setWasteReason('');
    setWasteDate(new Date().toISOString().split('T')[0]);
  };

  const handleWasteSubmit = async (e) => {
    e.preventDefault();

    if (!wasteIngredientId) {
      return;
    }

    const wastePayload = {
      ingredient_id: wasteIngredientId,
      quantity: Number(wasteQuantity),
      reason_category: wasteReason,
      waste_date: wasteDate,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/inventory/waste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wastePayload),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Waste item recorded successfully!');
        setWasteIngredientId(null);
        setWasteQuantity('');
        setWasteReason('');
        setWasteDate(new Date().toISOString().split('T')[0]);
        await fetchIngredients();
      } else {
        alert(`Error: ${result.message || result.error || 'Unable to record waste.'}`);
      }
    } catch (error) {
      console.error('Waste submission error:', error);
      alert('Could not connect to the server.');
    }
  };

  return (
    <div className="inventory-container">
      
      <header className="inv-header">
        <h1>📦 ServiQ Stockroom</h1>
        <button className="back-btn" onClick={() => navigate('/inventory/waste')}>
          🗑️ Waste Records
        </button>
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

            <div>
              <label>Supplier</label>
              <select
                value={newIngredientSupplierId}
                onChange={(e) => setNewIngredientSupplierId(e.target.value)}
              >
                <option value="">No supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.supplier_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Supply Date</label>
              <input
                type="date"
                value={newIngredientDateSupplied}
                onChange={(e) => setNewIngredientDateSupplied(e.target.value)}
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

        <div className="supplier-panel">
          <h3>🧾 Suppliers</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
            Add suppliers and review supplier ingredient relationships.
          </p>

          <form onSubmit={handleSaveSupplier} className="supplier-form">
            <div>
              <label className="label">Supplier Name</label>
              <input
                className="input-style"
                type="text"
                placeholder="e.g., Fresh Farms"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Contact Number</label>
              <input
                className="input-style"
                type="text"
                placeholder="e.g., 0917 123 4567"
                value={supplierContact}
                onChange={(e) => setSupplierContact(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Address</label>
              <input
                className="input-style"
                type="text"
                placeholder="e.g., 123 Market St"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">
                Add Supplier
              </button>
            </div>
          </form>

          {supplierError && <div className="error-message">{supplierError}</div>}

          <div style={{ marginTop: '20px' }}>
            <h4>Supplier Directory</h4>
            {suppliers.length === 0 ? (
              <p>No suppliers found.</p>
            ) : (
              suppliers.map((supplier) => (
                <div key={supplier.supplier_id} className="stock-item">
                  <div className="stock-details">
                    <div className="stock-header">
                      <span className="stock-name">{supplier.supplier_name}</span>
                    </div>
                    <div className="stock-info-grid">
                      <span className="info-label">Contact: {supplier.contact_number}</span>
                      <span className="info-label">Address: {supplier.supplier_address}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4>Supplied Ingredients</h4>
            {supplierIngredients.length === 0 ? (
              <p>No supplier/ingredient data available.</p>
            ) : (
              supplierIngredients.map((item, index) => (
                <div key={`${item.supplier_id}-${item.ingredient_id}-${index}`} className="stock-item">
                  <div className="stock-details">
                    <div className="stock-header">
                      <span className="stock-name">{item.supplier_name}</span>
                      <span className="stock-unit">{item.ingredient_name ? `- ${item.ingredient_name}` : ''}</span>
                    </div>
                    <div className="stock-info-grid">
                      <span className="info-label">Ingredient ID: {item.ingredient_id}</span>
                      <span className="info-label">Quantity: {item.quantity}</span>
                      <span className="info-label">Price: ₱{item.supplied_price}</span>
                      <span className="info-label">Supplied: {item.date_supplied}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="current-stock-panel">
          <h3>📊 Current Stock Levels</h3>
          {error && <div className="error-message">{error}</div>}
          <div style={{ marginTop: '20px' }}>
            {inventory.map((item) => (
              <React.Fragment key={item.ingredient_id}>
                <div className="stock-item">
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
                  <div className="stock-actions">
                    <button className="edit-btn" type="button" onClick={() => handleEditIngredient(item)}>
                      Edit
                    </button>
                    <button className="record-btn" type="button" onClick={() => openWasteForm(item)}>
                      {wasteIngredientId === item.ingredient_id ? 'Cancel Waste' : 'Record Waste'}
                    </button>
                    <button className="supply-btn" type="button" onClick={() => openSupplyForm(item)}>
                      {supplyIngredientId === item.ingredient_id ? 'Cancel Supply' : 'Supply'}
                    </button>
                  </div>
                </div>
                {supplyIngredientId === item.ingredient_id && (
                  <form className="supply-entry-form" onSubmit={handleSupplySubmit}>
                    <div className="supply-form-row">
                      <div>
                        <label>Supply Quantity</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={supplyQuantity}
                          onChange={(e) => setSupplyQuantity(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label>Supplier</label>
                        <select
                          value={supplySupplierId}
                          onChange={(e) => setSupplySupplierId(e.target.value)}
                          required
                        >
                          <option value="">Select supplier</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.supplier_id} value={supplier.supplier_id}>
                              {supplier.supplier_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label>Supply Date</label>
                        <input
                          type="date"
                          value={supplyDate}
                          onChange={(e) => setSupplyDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="supply-form-row" style={{ marginTop: '12px' }}>
                      <div>
                        <label>Price per Unit</label>
                        <input
                          style={{ width: '25%' }}
                          type="number"
                          min="0"
                          step="0.01"
                          value={supplyPrice}
                          onChange={(e) => setSupplyPrice(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {supplyError && <div className="error-message" style={{ marginTop: '12px' }}>{supplyError}</div>}

                    <div className="form-actions waste-actions">
                      <button type="submit" className="save-btn">
                        Save Supply Record
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={clearSupplyForm}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
                {wasteIngredientId === item.ingredient_id && (
                  <form className="waste-entry-form" onSubmit={handleWasteSubmit}>
                  <div className="waste-form-row">
                    <div>
                      <label>Waste Quantity</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={wasteQuantity}
                        onChange={(e) => setWasteQuantity(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label>Reason</label>
                      <input
                        type="text"
                        placeholder="e.g., Spoiled, Damaged, Expired"
                        value={wasteReason}
                        onChange={(e) => setWasteReason(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label>Waste Date</label>
                      <input
                        type="date"
                        value={wasteDate}
                        onChange={(e) => setWasteDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions waste-actions">
                    <button type="submit" className="save-btn">
                      Save Waste Record
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setWasteIngredientId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}