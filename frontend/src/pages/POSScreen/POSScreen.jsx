import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderContext } from '../../context/OrderContext';
import { MenuContext } from '../../context/MenuContext';
import { InventoryContext } from '../../context/InventoryContext';
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup';
import './POSScreen.css';

const POSScreen = () => {
  const navigate = useNavigate();
  const { addOrder } = useContext(OrderContext);
  const { menuItems, addons, menuError } = useContext(MenuContext);
  const { packages } = useContext(InventoryContext);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedMenuItemAddons, setSelectedMenuItemAddons] = useState([]);
  const [isLoadingMenuItemAddons, setIsLoadingMenuItemAddons] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getItemId = (item) =>
    item.package_id ? `package-${item.package_id}` : `menu-${item.menu_item_id}`;

  const addLineItemToCart = (item) => {
    const itemId = getItemId(item);
    const cartItem = {
      id: itemId,
      quantity: 1,
      name: item.name ?? item.package_name,
      price: parseFloat(item.price ?? item.total_price) || 0,
      menu_item_id: item.menu_item_id,
      package_id: item.package_id,
      addons: []
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find((current) => current.id === itemId);
      if (existingItem) {
        return prevCart.map((current) =>
          current.id === itemId
            ? { ...current, quantity: current.quantity + 1 }
            : current
        );
      }
      return [...prevCart, cartItem];
    });
  };

  const changeCartItemQuantity = (itemId, delta) => {
    setCart((prevCart) =>
      prevCart.reduce((acc, item) => {
        if (item.id !== itemId) {
          acc.push(item);
          return acc;
        }

        const nextQuantity = item.quantity + delta;
        if (nextQuantity > 0) {
          acc.push({ ...item, quantity: nextQuantity });
        }
        return acc;
      }, [])
    );
  };

  const selectMenuItem = async (menuItem) => {
    if (selectedMenuItem?.menu_item_id === menuItem.menu_item_id) {
      setSelectedMenuItem(null);
      setSelectedMenuItemAddons([]);
      return;
    }

    setSelectedMenuItem(menuItem);
    setIsLoadingMenuItemAddons(true);
    setSelectedMenuItemAddons([]);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/menu/item/${menuItem.menu_item_id}/addon`);
      const result = await response.json();

      if (response.ok && result.success) {
        setSelectedMenuItemAddons(result.data.filter((addon) => addon.status === 'Available'));
      } else {
        setSelectedMenuItemAddons([]);
      }
    } catch (error) {
      setSelectedMenuItemAddons([]);
    } finally {
      setIsLoadingMenuItemAddons(false);
    }
  };

  const addAddonToCart = (addon, menuItemId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.menu_item_id === menuItemId);
      const addonEntry = { ...addon, quantity: 1 };

      if (existingItem) {
        const hasAddon = existingItem.addons.some((a) => a.addon_id === addon.addon_id);
        return prevCart.map((item) => {
          if (item.menu_item_id !== menuItemId) return item;
          if (hasAddon) {
            return {
              ...item,
              addons: item.addons.map((a) =>
                a.addon_id === addon.addon_id ? { ...a, quantity: a.quantity + 1 } : a
              )
            };
          }
          return { ...item, addons: [...item.addons, addonEntry] };
        });
      }

      const menuItem = menuItems.find((m) => m.menu_item_id === menuItemId);
      if (!menuItem) return prevCart;

      return [
        ...prevCart,
        {
          id: getItemId(menuItem),
          menu_item_id: menuItemId,
          quantity: 1,
          name: menuItem.name,
          price: parseFloat(menuItem.price) || 0,
          addons: [addonEntry]
        }
      ];
    });
  };

  const changeCartItemAddonQuantity = (menuItemId, addonId, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.menu_item_id !== menuItemId) return item;

        const newAddons = item.addons
          .map((addon) =>
            addon.addon_id === addonId
              ? { ...addon, quantity: Math.max(0, addon.quantity + delta) }
              : addon
          )
          .filter((addon) => addon.quantity > 0);

        return { ...item, addons: newAddons };
      })
    );
  };

  const totalPrice = cart.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const addonTotal = (item.addons || []).reduce(
      (addonSum, addon) => addonSum + addon.price * addon.quantity,
      0
    );
    return sum + itemTotal + addonTotal;
  }, 0);

  const displayItems = activeCategory === 'Packages' ? packages : menuItems;
  const filteredItems = displayItems.filter((item) => {
    const label = (item.name ?? item.package_name).toLowerCase();
    const matchesSearch = label.includes(searchQuery.toLowerCase());

    if (displayItems === menuItems) {
      return matchesSearch && item.availability_status === 'Available';
    }

    return matchesSearch;
  });

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    setStatusMessage('');
    setErrorMessage('');

    const orderPayload = {
      items: cart.map((item) =>
        item.package_id
          ? { package_id: item.package_id, quantity: item.quantity, addons: [] }
          : {
              menu_item_id: item.menu_item_id,
              quantity: item.quantity,
              addons: (item.addons || []).map((addon) => ({
                id: addon.addon_id,
                quantity: addon.quantity
              }))
            }
      )
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/order/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        addOrder(cart, totalPrice, 'Table 1', result.order_id);
        setCart([]);
        setStatusMessage('Order submitted successfully.');
      } else {
        setErrorMessage(result.message || result.error || 'Unable to submit order');
      }
    } catch (error) {
      setErrorMessage('Failed to send order. Check backend server.');
    } finally {
      setIsSubmittingOrder(false);
      setIsCheckoutModalOpen(false);
    }
  };

  return (
    <div className="pos-container">
      <div className="logo-container">
        <img src="../public/serviq-logo-white.png" alt="Logo" className="logo" />
      </div>
      <div className="pos-nav-row">
        <button className="nav-btn" onClick={() => navigate('/kds')}>Kitchen</button>
        <button className="nav-btn" onClick={() => navigate('/inventory')}>Inventory</button>
        <button className="nav-btn" onClick={() => navigate('/admin')}>Shift Management</button>
        <button className="nav-btn" onClick={() => navigate('/reservations')}>Reservations</button>
        <button className="nav-btn" onClick={() => navigate('/manage-menu')}>Manage Menu</button>
        <button className="nav-btn" onClick={() => navigate('/attendance')}>Attendance</button>
      </div>

      <div className="pos-main">
        <section className="menu-section">
          <div className="menu-controls">
            <input
              type="text"
              placeholder="Search menu items..."
              className="search-bar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="category-filters">
              {['All', 'Packages'].map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {menuError && <p className="error-text">{menuError}</p>}
          {errorMessage && <p className="error-text">{errorMessage}</p>}
          {filteredItems.length === 0 ? (
            <p className="empty-cart">No items found.</p>
          ) : (
            <>
              <div className="item-grid">
                {filteredItems.map((item) => {
                  const itemId = item.menu_item_id ?? item.package_id ?? item.addon_id;
                  const isAddon = activeCategory === 'Addon';
                  const isPackage = activeCategory === 'Packages';
                  const label = item.name ?? item.package_name;
                  const priceValue = parseFloat(item.price ?? item.total_price) || 0;

                  return (
                    <div
                      key={itemId}
                      className={`item-card ${isAddon ? 'addon-card' : ''}`}
                    >
                      <h4>{label}</h4>
                      <p>₱{priceValue.toFixed(2)}</p>
                      {isAddon && <span className="addon-pill">Addon</span>}
                      {isPackage && <span className="package-pill">Package</span>}
                      {!isAddon && (
                        <div className="item-card-actions">
                          <button
                            className="small-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              addLineItemToCart(item);
                            }}
                          >
                            Add
                          </button>
                          {!isPackage && (
                            <button
                              className="small-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectMenuItem(item);
                              }}
                            >
                              {selectedMenuItem?.menu_item_id === item.menu_item_id
                                ? 'Hide Addons'
                                : 'Addons'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedMenuItem && selectedMenuItem.menu_item_id && (
                <div className="selected-addons-panel">
                  <h4>Addons for {selectedMenuItem.name}</h4>
                  {isLoadingMenuItemAddons ? (
                    <p>Loading available addons...</p>
                  ) : selectedMenuItemAddons.length === 0 ? (
                    <p>No addons available for this item.</p>
                  ) : (
                    <div className="addon-grid">
                      {selectedMenuItemAddons.map((addon) => (
                        <div key={addon.addon_id} className="addon-card">
                          <h5>{addon.name}</h5>
                          <p>₱{parseFloat(addon.price).toFixed(2)}</p>
                          <button
                            className="small-btn"
                            onClick={() => addAddonToCart(addon, selectedMenuItem.menu_item_id)}
                          >
                            Add Addon
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <section className="order-section">
          <div className="ticket-header">
            <h3>Current Order</h3>
            <span className="order-id">#ORD-{new Date().getTime().toString().slice(-4)}</span>
          </div>

          <div className="cart-list">
            {cart.length === 0 ? (
              <p className="empty-cart">Cart is empty</p>
            ) : (
              cart.map((item) => {
                const addonTotal = (item.addons || []).reduce(
                  (sum, addon) => sum + addon.price * addon.quantity,
                  0
                );

                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="name">{item.name}</span>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => changeCartItemQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => changeCartItemQuantity(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <span className="price">₱{((item.price * item.quantity) + addonTotal).toFixed(2)}</span>
                    </div>

                    {item.addons && item.addons.length > 0 && (
                      <div className="cart-addons">
                        {item.addons.map((addon) => (
                          <div key={addon.addon_id} className="cart-addon-item">
                            <span className="addon-name">+ {addon.name}</span>
                            <div className="addon-qty-controls">
                              <button className="qty-btn" onClick={() => changeCartItemAddonQuantity(item.menu_item_id, addon.addon_id, -1)}>-</button>
                              <span>{addon.quantity}</span>
                              <button className="qty-btn" onClick={() => changeCartItemAddonQuantity(item.menu_item_id, addon.addon_id, 1)}>+</button>
                            </div>
                            <span className="addon-price">₱{(addon.price * addon.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="checkout-panel">
            <div className="total-display">
              <span>Total:</span>
              <span>₱{totalPrice.toFixed(2)}</span>
            </div>
            <button 
              className="checkout-btn"
              disabled={cart.length === 0 || isSubmittingOrder}
              onClick={() => setIsCheckoutModalOpen(true)}
            >
              {isSubmittingOrder ? 'Submitting...' : 'Proceed to Checkout'}
            </button>
            {statusMessage && <p className="success-text">{statusMessage}</p>}
            {errorMessage && <p className="error-text">{errorMessage}</p>}
          </div>
        </section>
      </div> 

      <ConfirmationPopup 
        isOpen={isCheckoutModalOpen}
        message={`Total amount: ₱${totalPrice.toFixed(2)}. Confirm transaction?`}
        onCancel={() => setIsCheckoutModalOpen(false)}
        onConfirm={handleSubmitOrder}
      />
    </div> 
  );
};

export default POSScreen;