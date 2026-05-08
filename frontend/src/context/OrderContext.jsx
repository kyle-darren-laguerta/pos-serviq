import React, { createContext, useState } from 'react';

// Tell Vite's linter to chill out for this specific line
// eslint-disable-next-line react-refresh/only-export-components
export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // Start with an empty array. The kitchen is clean!
  const [orders, setOrders] = useState([]); 

  // Function to add a new order (Used by the POS)
  const addOrder = (cartItems, total, tableNum = 'Takeout') => {
    const newOrder = {
      id: `ORD-${new Date().getTime().toString().slice(-4)}`, // Generate random ID
      table: tableNum,
      status: 'Pending', // All new orders start as Yellow/Pending
      
      // 🚨 THE FIX: Just copy the array exactly as it is!
      // This ensures the Kitchen receives the exact 'quantity' and 'item_name' labels.
      items: [...cartItems], 
      
      total: total
    };
    
    // Add the new order to the global state
    setOrders((prevOrders) => [...prevOrders, newOrder]);
  };

  // Function to bump order status (Used by the KDS)
  const updateOrderStatus = (orderId, currentStatus) => {
    setOrders((prevOrders) => 
      prevOrders.map((order) => {
        if (order.id === orderId) {
          if (currentStatus === 'Pending') return { ...order, status: 'Preparing' };
          if (currentStatus === 'Preparing') return { ...order, status: 'Ready' };
          if (currentStatus === 'Ready') return { ...order, status: 'Completed' };
        }
        return order;
      }).filter(order => order.status !== 'Completed') // Remove if completed
    );
  };

  return (
    // Expose the state and functions to any screen that asks for it
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};