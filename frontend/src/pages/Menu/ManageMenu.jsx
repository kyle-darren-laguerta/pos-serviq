import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageMenu.css';
import { MenuContext } from '../../context/MenuContext';

export default function ManageMenu() {
  const navigate = useNavigate();

  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [recipeRows, setRecipeRows] = useState([
    { ingredient_id: '', quantity_required: '', unit_of_measure: '' }
  ]);

  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonMenuItemIds, setAddonMenuItemIds] = useState([]);
  const [editAddonId, setEditAddonId] = useState(null);
  const [isEditAddonMode, setIsEditAddonMode] = useState(false);

  const { menuItems, addons, fetchMenuItems, fetchAddons } = useContext(MenuContext);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('menu');
  const [packageName, setPackageName] = useState('');
  const [packageStatus, setPackageStatus] = useState('available');
  const [selectedItems, setSelectedItems] = useState([]);
  const [foodPackages, setFoodPackages] = useState([]);
  const [packageError, setPackageError] = useState(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/inventory/ingredient`);
        const result = await response.json();

        if (response.ok && result.success) {
          setIngredients(result.data);
        } else {
          console.error('Ingredient fetch error:', result.message);
        }
      } catch (err) {
        console.error('Unable to fetch ingredients:', err);
      }
    };

    fetchIngredients();
    fetchFoodPackages();
  }, []);

  const clearForm = () => {
    setItemName('');
    setItemPrice('');
    setEditItemId(null);
    setIsEditMode(false);
    setRecipeRows([{ ingredient_id: '', quantity_required: '', unit_of_measure: '' }]);
  };

  const clearAddonForm = () => {
    setAddonName('');
    setAddonPrice('');
    setAddonMenuItemIds([]);
    setEditAddonId(null);
    setIsEditAddonMode(false);
  };

  const handleRecipeIngredientChange = (index, ingredientId) => {
    const updated = [...recipeRows];
    updated[index].ingredient_id = parseInt(ingredientId, 10) || '';
    const selected = ingredients.find((ing) => ing.ingredient_id === parseInt(ingredientId, 10));
    updated[index].unit_of_measure = selected?.unit_of_measure || '';
    setRecipeRows(updated);
  };

  const handleRecipeQuantityChange = (index, quantity) => {
    const updated = [...recipeRows];
    updated[index].quantity_required = parseFloat(quantity) || '';
    setRecipeRows(updated);
  };

  const handleRecipeUnitChange = (index, unit) => {
    const updated = [...recipeRows];
    updated[index].unit_of_measure = unit;
    setRecipeRows(updated);
  };

  const handleAddRecipeRow = () => {
    setRecipeRows([...recipeRows, { ingredient_id: '', quantity_required: '', unit_of_measure: '' }]);
  };

  const handleRemoveRecipeRow = (index) => {
    setRecipeRows(recipeRows.filter((_, rowIndex) => rowIndex !== index));
  };

  const fetchRecipe = async (menuItemId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/menu/recipe/${menuItemId}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setRecipeRows(
          result.data.length > 0
            ? result.data.map((row) => ({
                ingredient_id: row.ingredient_id,
                quantity_required: row.quantity_required,
                unit_of_measure: row.unit_of_measure
              }))
            : [{ ingredient_id: '', quantity_required: '', unit_of_measure: '' }]
        );
      } else {
        setRecipeRows([{ ingredient_id: '', quantity_required: '', unit_of_measure: '' }]);
      }
    } catch (err) {
      console.error('Unable to fetch recipe:', err);
      setRecipeRows([{ ingredient_id: '', quantity_required: '', unit_of_measure: '' }]);
    }
  };

  const handleEditItem = (item) => {
    setItemName(item.name);
    setItemPrice(String(item.price));
    setEditItemId(item.menu_item_id);
    setIsEditMode(true);
    clearAddonForm();
    fetchRecipe(item.menu_item_id);
  };

  const handleToggleAvailability = async (item) => {
    const nextStatus = item.availability_status === 'Available' ? 'Unavailable' : 'Available';

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/menu/item/${item.menu_item_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability_status: nextStatus })
      });

      const result = await response.json();
      if (!response.ok) {
        alert(`Error: ${result.message || result.error || 'Unable to update availability.'}`);
        return;
      }

      await fetchMenuItems();
    } catch (error) {
      console.error('Availability toggle failed:', error);
      alert('Could not update menu item availability.');
    }
  };

  const handleEditAddon = (addon) => {
    setAddonName(addon.name);
    setAddonPrice(String(addon.price));
    setEditAddonId(addon.addon_id);
    setIsEditAddonMode(true);
    setAddonMenuItemIds([]);
    clearForm();
  };

  const handleToggleAddonStatus = async (addon) => {
    const nextStatus = addon.status === 'Available' ? 'Unavailable' : 'Available';

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/menu/addon/${addon.addon_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      const result = await response.json();
      if (!response.ok) {
        alert(`Error: ${result.message || result.error || 'Unable to update addon status.'}`);
        return;
      }

      await fetchAddons();
    } catch (error) {
      console.error('Addon status toggle failed:', error);
      alert('Could not update addon status.');
    }
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();

    const menuPayload = {
      name: itemName,
      price: parseFloat(itemPrice),
    };

    const isUpdating = isEditMode && editItemId;
    const menuUrl = isUpdating
      ? `${import.meta.env.VITE_BACKEND_URL}/menu/item/${editItemId}`
      : `${import.meta.env.VITE_BACKEND_URL}/menu/item`;

    const filteredRecipe = recipeRows.filter(
      (row) => row.ingredient_id && row.quantity_required && row.unit_of_measure
    );

    const saveRecipe = async (menuItemId) => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/menu/recipe/${menuItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipe: filteredRecipe })
        });

        const result = await response.json();
        if (!response.ok) {
          console.error('Recipe save failed:', result);
        }
      } catch (err) {
        console.error('Unable to save recipe:', err);
      }
    };

    try {
      const response = await fetch(menuUrl, {
        method: isUpdating ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuPayload),
      });

      const result = await response.json();
      let menuItemId = editItemId;

      if (!response.ok) {
        alert(`Error: ${result.message || result.error || 'Unable to save menu item.'}`);
        return;
      }

      if (!isUpdating && result.data?.insertId) {
        menuItemId = result.data.insertId;
      }

      if (menuItemId) {
        await saveRecipe(menuItemId);
      }

      if (isUpdating) {
        alert('Menu item updated successfully!');
      } else {
        alert('Menu item saved successfully!');
      }

      await fetchMenuItems();
      clearForm();
    } catch (error) {
      console.error('Submission error:', error);
      alert('Could not connect to the server.');
    }
  };

  const handleSaveAddon = async (e) => {
    e.preventDefault();

    const selectedMenuItemIds = addonMenuItemIds
      .map((id) => parseInt(id, 10))
      .filter((id) => !Number.isNaN(id));

    const addonPayload = {
      name: addonName,
      price: parseFloat(addonPrice),
      menu_item_ids: selectedMenuItemIds.length > 0 ? selectedMenuItemIds : undefined,
    };

    const isUpdating = isEditAddonMode && editAddonId;
    const url = isUpdating
      ? `${import.meta.env.VITE_BACKEND_URL}/menu/addon/${editAddonId}`
      : `${import.meta.env.VITE_BACKEND_URL}/menu/addon`;

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

  const fetchFoodPackages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/food-package/`);
      const result = await response.json();

      if (response.ok && result.success) {
        setFoodPackages(result.data);
        setPackageError(null);
      } else {
        setPackageError(result.message || 'Unable to load food packages.');
      }
    } catch (error) {
      console.error('Unable to fetch food packages:', error);
      setPackageError('Could not connect to the server.');
    }
  };

  const handleAddPackageItem = () => {
    setSelectedItems([...selectedItems, { menu_item_id: '', quantity: 1 }]);
  };

  const handleRemovePackageItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handlePackageItemChange = (index, menuItemId) => {
    const updated = [...selectedItems];
    updated[index].menu_item_id = parseInt(menuItemId, 10) || '';
    setSelectedItems(updated);
  };

  const handlePackageQuantityChange = (index, quantity) => {
    const updated = [...selectedItems];
    updated[index].quantity = parseInt(quantity, 10) || 1;
    setSelectedItems(updated);
  };

  const handleCreateFoodPackage = async (e) => {
    e.preventDefault();

    if (!packageName || selectedItems.length === 0) {
      setPackageError('Please enter a package name and add at least one menu item.');
      return;
    }

    const payloadItems = selectedItems
      .filter((item) => item.menu_item_id)
      .map((item) => ({ menu_item_id: item.menu_item_id, quantity: item.quantity }));

    if (payloadItems.length === 0) {
      setPackageError('Please select at least one valid menu item.');
      return;
    }

    const totalPrice = payloadItems.reduce((sum, item) => {
      const menuItem = menuItems.find((mi) => mi.menu_item_id === item.menu_item_id);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/food-package/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_name: packageName,
          total_price: totalPrice,
          status: packageStatus,
          items: payloadItems,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setPackageName('');
        setPackageStatus('available');
        setSelectedItems([]);
        setPackageError(null);
        fetchFoodPackages();
        alert('Food package created successfully!');
      } else {
        setPackageError(result.message || 'Unable to create food package.');
      }
    } catch (error) {
      console.error('Unable to create food package:', error);
      setPackageError('Could not connect to the server.');
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

      <div className="manage-menu-tabs">
        <button
          className={`tab ${activeSection === 'menu' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveSection('menu')}
        >
          Manage Menu
        </button>
        <button
          className={`tab ${activeSection === 'packages' ? 'active' : ''}`}
          type="button"
          onClick={() => setActiveSection('packages')}
        >
          Manage Packages
        </button>
      </div>

      {activeSection === 'menu' ? (
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

            <div className="recipe-panel">
              <h4>Recipe for this Menu Item</h4>
              {recipeRows.map((row, index) => (
                <div className="recipe-row" key={`${row.ingredient_id}-${index}`}>
                  <div>
                    <label>Ingredient</label>
                    <select
                      value={row.ingredient_id}
                      onChange={(e) => handleRecipeIngredientChange(index, e.target.value)}
                      required
                    >
                      <option value="">Select ingredient</option>
                      {ingredients.map((ingredient) => (
                        <option key={ingredient.ingredient_id} value={ingredient.ingredient_id}>
                          {ingredient.ingredient_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Quantity Required</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.quantity_required}
                      onChange={(e) => handleRecipeQuantityChange(index, e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label>Unit of Measure</label>
                    <input
                      type="text"
                      value={row.unit_of_measure}
                      onChange={(e) => handleRecipeUnitChange(index, e.target.value)}
                      placeholder="e.g., grams"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveRecipeRow(index)}
                    aria-label="Remove recipe ingredient row"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button type="button" className="add-btn" onClick={handleAddRecipeRow}>
                + Add Ingredient to Recipe
              </button>
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
                      <span className={`status ${item.availability_status === 'Available' ? 'available' : 'unavailable'}`}>
                        {item.availability_status || 'Available'}
                      </span>
                    </div>
                  </div>
                  <div className="menu-item-actions">
                    <button
                      className="edit-btn"
                      type="button"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="toggle-btn"
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                    >
                      {item.availability_status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </div>
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

            <div>
              <label>Applies To Menu Items</label>
              <select
                multiple
                size={Math.min(6, menuItems.length || 6)}
                value={addonMenuItemIds}
                onChange={(e) =>
                  setAddonMenuItemIds(Array.from(e.target.selectedOptions, (option) => option.value))
                }
                required={!isEditAddonMode}
              >
                {menuItems.map((menuItem) => (
                  <option key={menuItem.menu_item_id} value={menuItem.menu_item_id}>
                    {menuItem.name}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Hold Ctrl (Windows) or Command (Mac) to select multiple menu items.
              </p>
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
                      <span className={`status ${addon.status === 'Available' ? 'available' : 'unavailable'}`}>
                        {addon.status || 'Available'}
                      </span>
                    </div>
                  </div>
                  <div className="addon-actions">
                    <button
                      className="edit-btn"
                      type="button"
                      onClick={() => handleEditAddon(addon)}
                    >
                      Edit
                    </button>
                    <button
                      className="toggle-btn"
                      type="button"
                      onClick={() => handleToggleAddonStatus(addon)}
                    >
                      {addon.status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                  </div>
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
      ) : (
        <div className="packages-container">
          <div className="add-item-panel">
            <h3>📦 Create New Food Package</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
              Build food packages from existing menu items.
            </p>
            {packageError && <p className="error-text">{packageError}</p>}
            <form onSubmit={handleCreateFoodPackage}>
              <div>
                <label>Package Name</label>
                <input
                  type="text"
                  placeholder="e.g., Barkada Bundle"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label>Status</label>
                <select
                  value={packageStatus}
                  onChange={(e) => setPackageStatus(e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="recipe-panel">
                <h4>Package Items</h4>
                {selectedItems.map((item, index) => (
                  <div className="recipe-row" key={`${item.menu_item_id}-${index}`}>
                    <div>
                      <label>Menu Item</label>
                      <select
                        value={item.menu_item_id}
                        onChange={(e) => handlePackageItemChange(index, e.target.value)}
                        required
                      >
                        <option value="">Select menu item</option>
                        {menuItems.map((menuItem) => (
                          <option key={menuItem.menu_item_id} value={menuItem.menu_item_id}>
                            {menuItem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handlePackageQuantityChange(index, e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemovePackageItem(index)}
                      aria-label="Remove package item row"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button type="button" className="add-btn" onClick={handleAddPackageItem}>
                  + Add Menu Item
                </button>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  Save Food Package
                </button>
              </div>
            </form>
          </div>

          <div className="menu-list-panel packages-list-panel">
            <h3>📦 Current Food Packages</h3>
            <div style={{ marginTop: '20px' }}>
              {foodPackages.length > 0 ? (
                foodPackages.map((pkg) => (
                  <div key={pkg.package_id} className="menu-item">
                    <div className="menu-item-details">
                      <div className="menu-item-header">
                        <span className="menu-item-name">{pkg.package_name}</span>
                      </div>
                      <div className="menu-item-info">
                        <span className="price">
                          ₱{parseFloat(pkg.total_price).toFixed(2)}
                        </span>
                        <span className={`status ${pkg.status === 'available' ? 'available' : 'unavailable'}`}>
                          {pkg.status}
                        </span>
                      </div>
                      <div className="package-item-list">
                        {pkg.items?.map((item) => (
                          <div key={`${pkg.package_id}-${item.menu_item_id}`} className="package-item-row">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '20px' }}>
                  No food packages found. Create one to get started!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
