import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageMenu.css';

export default function ManageMenu() {
  const navigate = useNavigate();

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [editAddonId, setEditAddonId] = useState(null);
  const [isEditAddonMode, setIsEditAddonMode] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [addons, setAddons] = useState([]);
  const [error, setError] = useState(null);

  const clearForm = () => {
    setItemName('');
    setItemPrice('');
    setEditItemId(null);
    setIsEditMode(false);
  };

  const clearAddonForm = () => {
    setAddonName('');
    setAddonPrice('');
    setEditAddonId(null);
    setIsEditAddonMode(false);
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:3000/menu/item');
      const result = await response.json();

      if (response.ok && result.sucess) {
        setMenuItems(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch menu items');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    }
  };

  const fetchAddons = async () => {
    try {
      const response = await fetch('http://localhost:3000/menu/addon');
      const result = await response.json();

      if (response.ok && result.sucess) {
        setAddons(result.data);
      } else {
        console.warn(result.message || 'Failed to fetch addons');
      }
    } catch (err) {
      console.warn('Could not fetch addons:', err);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchAddons();
  }, []);

  const handleEditItem = (item) => {
    setItemName(item.name);
    setItemPrice(String(item.price));
    setEditItemId(item.menu_item_id);
    setIsEditMode(true);
    clearAddonForm();
  };

  const handleEditAddon = (addon) => {
    setAddonName(addon.name);
    setAddonPrice(String(addon.price));
    setEditAddonId(addon.addon_id);
    setIsEditAddonMode(true);
    clearForm();
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();

    const menuPayload = {
      name: itemName,
      price: parseFloat(itemPrice),
    };

    const isUpdating = isEditMode && editItemId;
    console.log(isUpdating);
    const url = isUpdating
      ? `http://localhost:3000/menu/item/${editItemId}`
      : 'http://localhost:3000/menu/item';

    try {
      const response = await fetch(url, {
        method: isUpdating ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuPayload),
      });

      const result = await response.json();

      if (response.ok) {
        if (isUpdating) {
          alert('Menu item updated successfully!');
        } else {
          alert('Menu item saved successfully!');
        }

        await fetchMenuItems();
        clearForm();
      } else {
        alert(`Error: ${result.message || result.error || 'Unable to save menu item.'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Could not connect to the server.');
    }
  };

  const handleSaveAddon = async (e) => {
    e.preventDefault();

    const addonPayload = {
      name: addonName,
      price: parseFloat(addonPrice),
    };

    const isUpdating = isEditAddonMode && editAddonId;
    const url = isUpdating
      ? `http://localhost:3000/menu/addon/${editAddonId}`
      : 'http://localhost:3000/menu/addon';

    try {
      const response = await fetch(url, {
        method: isUpdating ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addonPayload),
      });

      const result = await response.json();

      if (response.ok) {
        if (isUpdating) {
          alert('Addon updated successfully!');
        } else {
          alert('Addon saved successfully!');
        }

        await fetchAddons();
        clearAddonForm();
      } else {
        alert(`Error: ${result.message || result.error || 'Unable to save addon.'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Could not connect to the server.');
    }
  };

  return (
    <div className="menu-container">
      <header className="menu-header">
        <h1>🍽️ ServiQ Menu Manager</h1>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Return to POS
        </button>
      </header>

      <div className="menu-grid">
        <div className="add-item-panel">
          <h3>➕ Add New Menu Item</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
            Create or update menu items to sync with the database.
          </p>

          <form onSubmit={handleSaveMenuItem}>
            <div>
              <label>Item Name</label>
              <input
                type="text"
                placeholder="e.g., Tapsilog"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Price (₱)</label>
              <input
                type="number"
                placeholder="e.g., 150.00"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {isEditMode ? 'Update Item' : 'Save to Database'}
              </button>
              {isEditMode && (
                <button type="button" className="cancel-btn" onClick={clearForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="menu-list-panel">
          <h3>📋 Current Menu Items</h3>
          <div style={{ marginTop: '20px' }}>
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item.menu_item_id} className="menu-item">
                  <div className="menu-item-details">
                    <div className="menu-item-header">
                      <span className="menu-item-name">{item.name}</span>
                    </div>
                    <div className="menu-item-info">
                      <span className={`price ${item.availability_status === 'Available' ? 'available' : 'unavailable'}`}>
                        ₱{parseFloat(item.price).toFixed(2)}
                      </span>
                      <span className="status">
                        {item.availability_status || 'Available'}
                      </span>
                    </div>
                  </div>
                  <button
                    className="edit-btn"
                    type="button"
                    onClick={() => handleEditItem(item)}
                  >
                    Edit
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '20px' }}>
                No menu items found. Start by adding a new item!
              </p>
            )}
          </div>
        </div>

        <div className="add-item-panel">
          <h3>➕ Add New Addon</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
            Add extra items/sides that customers can add to their orders.
          </p>

          <form onSubmit={handleSaveAddon}>
            <div>
              <label>Addon Name</label>
              <input
                type="text"
                placeholder="e.g., Extra Rice"
                value={addonName}
                onChange={(e) => setAddonName(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Price (₱)</label>
              <input
                type="number"
                placeholder="e.g., 25.00"
                value={addonPrice}
                onChange={(e) => setAddonPrice(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {isEditAddonMode ? 'Update Addon' : 'Save to Database'}
              </button>
              {isEditAddonMode && (
                <button type="button" className="cancel-btn" onClick={clearAddonForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="menu-list-panel">
          <h3>📦 Current Addons</h3>
          <div style={{ marginTop: '20px' }}>
            {addons.length > 0 ? (
              addons.map((addon) => (
                <div key={addon.addon_id} className="menu-item">
                  <div className="menu-item-details">
                    <div className="menu-item-header">
                      <span className="menu-item-name">{addon.name}</span>
                    </div>
                    <div className="menu-item-info">
                      <span className="price">
                        ₱{parseFloat(addon.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="edit-btn"
                    type="button"
                    onClick={() => handleEditAddon(addon)}
                  >
                    Edit
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '20px' }}>
                No addons found. Start by adding a new addon!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
