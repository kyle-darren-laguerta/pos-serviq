import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderContext } from '../../context/OrderContext';
import { MenuContext } from '../../context/MenuContext';
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup';
import './POSScreen.css';

const POSScreen = () => {
  const navigate = useNavigate();
  const { addOrder } = useContext(OrderContext);
  const { menuItems, addons, menuError } = useContext(MenuContext);

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const addToCart = (item, source = 'menu') => {
    if (source === 'addon') {
      
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.menu_item_id === item.menu_item_id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.menu_item_id === item.menu_item_id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (menu_item_id) => {
    setCart((prevCart) =>
      prevCart.reduce((acc, item) => {
        if (item.menu_item_id === menu_item_id) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, [])
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const displayItems = activeCategory === 'Addon' ? addons : menuItems;
  const filteredItems = displayItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    setStatusMessage('');
    setErrorMessage('');

    const orderPayload = {
      items: cart.map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        addons: []
      }))
    };

    try {
      const response = await fetch('http://localhost:3000/order/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        addOrder(cart, totalPrice, 'Table 1');
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
              {['All', 'Addon'].map((cat) => (
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
            <div className="item-grid">
              {filteredItems.map((item) => {
                const itemId = item.menu_item_id ?? item.addon_id;
                const isAddon = activeCategory === 'Addon';
                return (
                  <div
                    key={itemId}
                    className={`item-card ${isAddon ? 'addon-card' : ''}`}
                    onClick={() => !isAddon && addToCart(item, 'menu')}
                  >
                    <h4>{item.name}</h4>
                    <p>₱{parseFloat(item.price).toFixed(2)}</p>
                    {isAddon && <span className="addon-pill">Addon</span>}
                  </div>
                );
              })}
            </div>
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
              cart.map((item) => (
                <div key={item.menu_item_id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="qty">{item.quantity}x</span>
                    <span className="name">{item.name}</span>
                  </div>
                  <div className="cart-item-actions">
                    <span className="price">₱{(item.price * item.quantity).toFixed(2)}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.menu_item_id)}>−</button>
                  </div>
                </div>
              ))
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