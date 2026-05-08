import React, { useContext } from 'react'; // <-- Changed from useState to useContext
import { useNavigate } from 'react-router-dom'; 
import { OrderContext } from '../../context/OrderContext';
import './KitchenDisplay.css';

export default function KitchenDisplay() {
  const navigate = useNavigate(); 
  
  // THE CONNECTION: Pulling the live data AND the bump function from the cloud!
  const { orders, updateOrderStatus } = useContext(OrderContext);

  return (
    <div className="kds-container">
      {/* KDS Header */}
      <header className="kds-header">
        <div className="kds-logo">ServiQ Kitchen Display</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontWeight: 'bold' }}>Active Tickets: {orders.length}</span>
          
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#334155',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ← Return to POS
          </button>
        </div>
      </header>

      {/* Ticket Grid Area */}
      <div className="ticket-grid">
        {orders.length === 0 ? (
          <div className="no-orders" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
            No active orders. Kitchen is clear! 
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={`ticket-card status-${order.status.toLowerCase()}`}>
              
              <div className="ticket-header-info">
                <h2>{order.id}</h2>
                <span className="table-badge">{order.table}</span>
              </div>
              
              <div className="ticket-status-bar">
                {order.status}
              </div>

              <ul className="prep-list">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {/* Notice we use item.quantity and item.item_name here now! */}
                    <span className="item-qty">{item.quantity}x</span> {item.item_name}
                  </li>
                ))}
              </ul>

              {/* Dynamic Bump Button uses the Cloud Function now */}
              <button 
                className="bump-btn"
                onClick={() => updateOrderStatus(order.id, order.status)}
              >
                {order.status === 'Pending' && 'Start Preparing (Bump)'}
                {order.status === 'Preparing' && 'Mark as Ready (Bump)'}
                {order.status === 'Ready' && 'Clear Ticket (Finish)'}
              </button>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}