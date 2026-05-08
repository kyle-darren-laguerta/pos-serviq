import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderContext } from '../../context/OrderContext';
import ConfirmationPopup from '../components/ConfirmationPopup/ConfirmationPopup';
import './POSScreen.css';

const initialMenuItems = [
  { id: 1, item_name: 'Tapsilog', price: 150.00, category: 'Meals' },
  { id: 2, item_name: 'Porksilog', price: 140.00, category: 'Meals' },
  { id: 3, item_name: 'Iced Tea', price: 50.00, category: 'Drinks' },
  { id: 4, item_name: 'Coke Mismo', price: 30.00, category: 'Drinks' },
  { id: 5, item_name: 'Barkada Package', price: 450.00, category: 'Packages' },
  { id: 6, item_name: 'Couple Promo', price: 280.00, category: 'Packages' }
];

const POSScreen = () => {
  const navigate = useNavigate();
  
  // Pulling the Global Brain function!
  const { addOrder } = useContext(OrderContext);

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => 
      prevCart.reduce((acc, item) => {
        if (item.id === id) {
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

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const filteredMenu = initialMenuItems.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pos-container">
      {/* --- VERTICAL NAVIGATION COLUMN --- */}
      <button className="nav-btn" onClick={() => navigate('/kds')}>Kitchen</button>
      <button className="nav-btn" onClick={() => navigate('/inventory')}>Inventory</button>
      <button className="nav-btn" onClick={() => navigate('/admin')}>Shift Management</button>
      <button className="nav-btn" onClick={() => navigate('/reservations')}>Reservations</button>
      <button className="nav-btn" onClick={() => navigate('/backoffice')}>Manage Menu</button>
      {/* ---> NEW ATTENDANCE BUTTON <--- */}
      <button className="nav-btn" onClick={() => navigate('/attendance')}>Attendance</button>
      {/* ---------------------------------- */}

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
              {['All', 'Drinks', 'Meals', 'Packages'].map(cat => (
                <button 
                  key={cat}
                  className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >{cat}</button>
              ))}
            </div>
          </div>

          <div className="item-grid">
            {filteredMenu.map((item) => (
              <div key={item.id} className="item-card" onClick={() => addToCart(item)}>
                <h4>{item.item_name}</h4>
                <p>₱{item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
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
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="qty">{item.quantity}x</span>
                    <span className="name">{item.item_name}</span>
                  </div>
                  <div className="cart-item-actions">
                    <span className="price">₱{(item.price * item.quantity).toFixed(2)}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>−</button>
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
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutModalOpen(true)}
            >
              Proceed to Checkout
            </button>
          </div>
        </section>
      </div> 

      <ConfirmationPopup 
        isOpen={isCheckoutModalOpen}
        message={`Total amount: ₱${totalPrice.toFixed(2)}. Confirm transaction?`}
        onCancel={() => setIsCheckoutModalOpen(false)}
        onConfirm={() => {
          // This is the magic line that sends it to the cloud!
          addOrder(cart, totalPrice, "Table 1"); 
          
          alert("Order Sent to Kitchen! 🧑‍🍳");
          setCart([]); 
          setIsCheckoutModalOpen(false); 
        }}
      />
    </div> 
  );
};

export default POSScreen;