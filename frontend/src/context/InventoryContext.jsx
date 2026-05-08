import React, { createContext, useState } from 'react';

// Tell Vite's linter to allow this export
// eslint-disable-next-line react-refresh/only-export-components
export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  // 1. The Master Stock List (Back-of-House)
  const [inventory, setInventory] = useState([
    { id: 'INV-001', item: 'Beef Tapa (Portion)', stock: 50 },
    { id: 'INV-002', item: 'Pork Chop (Portion)', stock: 40 },
    { id: 'INV-003', item: 'Egg (Pcs)', stock: 100 },
    { id: 'INV-004', item: 'Garlic Rice (Cup)', stock: 80 },
    { id: 'INV-005', item: 'Iced Tea (Cup)', stock: 60 },
    { id: 'INV-006', item: 'Coke Mismo (Bottle)', stock: 48 },
  ]);

  // Helper function to find an ingredient and subtract from it
  const deductIngredient = (currentStock, ingredientName, amountToDeduct) => {
    return currentStock.map(stockItem => 
      stockItem.item === ingredientName 
        ? { ...stockItem, stock: Math.max(0, stockItem.stock - amountToDeduct) } // Prevents negative stock
        : stockItem
    );
  };

  // 2. The Trigger Function (Used by the POS Checkout)
  const deductInventory = (cartItems) => {
    setInventory((prevInventory) => {
      let updatedStock = [...prevInventory];

      // Loop through everything in the cart
      cartItems.forEach((cartItem) => {
        const qty = cartItem.quantity;

        // RECIPE MAPPING: Break meals down into ingredients!
        if (cartItem.item_name === 'Tapsilog') {
          updatedStock = deductIngredient(updatedStock, 'Beef Tapa (Portion)', 1 * qty);
          updatedStock = deductIngredient(updatedStock, 'Egg (Pcs)', 1 * qty);
          updatedStock = deductIngredient(updatedStock, 'Garlic Rice (Cup)', 1 * qty);
        } 
        else if (cartItem.item_name === 'Porksilog') {
          updatedStock = deductIngredient(updatedStock, 'Pork Chop (Portion)', 1 * qty);
          updatedStock = deductIngredient(updatedStock, 'Egg (Pcs)', 1 * qty);
          updatedStock = deductIngredient(updatedStock, 'Garlic Rice (Cup)', 1 * qty);
        } 
        else if (cartItem.item_name === 'Iced Tea') {
          updatedStock = deductIngredient(updatedStock, 'Iced Tea (Cup)', 1 * qty);
        } 
        else if (cartItem.item_name === 'Coke Mismo') {
          updatedStock = deductIngredient(updatedStock, 'Coke Mismo (Bottle)', 1 * qty);
        }
      });

      return updatedStock; // Save the newly calculated stock
    });
  };

  return (
    <InventoryContext.Provider value={{ inventory, deductInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};