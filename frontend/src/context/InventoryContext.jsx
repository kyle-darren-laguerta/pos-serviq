import React, { createContext, useState } from 'react';

// Tell Vite's linter to allow this export
// eslint-disable-next-line react-refresh/only-export-components
export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  // 1. The Master Stock List (Back-of-House)
  const [inventory, setInventory] = useState([
    { id: 'INV-001', name: 'Beef Tapa (Portion)', unitOfMeasurement: 'pcs', minStock: 20, costPerUnit: 5.50, currentStock: 50 },
    { id: 'INV-002', name: 'Pork Chop (Portion)', unitOfMeasurement: 'pcs', minStock: 15, costPerUnit: 4.50, currentStock: 40 },
    { id: 'INV-003', name: 'Egg', unitOfMeasurement: 'pcs', minStock: 50, costPerUnit: 0.15, currentStock: 100 },
    { id: 'INV-004', name: 'Garlic Rice', unitOfMeasurement: 'cup', minStock: 30, costPerUnit: 2.00, currentStock: 80 },
    { id: 'INV-005', name: 'Iced Tea', unitOfMeasurement: 'cup', minStock: 25, costPerUnit: 1.50, currentStock: 60 },
    { id: 'INV-006', name: 'Coke Mismo', unitOfMeasurement: 'bottle', minStock: 20, costPerUnit: 3.00, currentStock: 48 },
  ]);

  // Helper function to find an ingredient and subtract from it
  const deductIngredient = (currentStock, ingredientName, amountToDeduct) => {
    return currentStock.map(stockItem => 
      stockItem.name === ingredientName 
        ? { ...stockItem, currentStock: Math.max(0, stockItem.currentStock - amountToDeduct) } // Prevents negative stock
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
          updatedStock = deductIngredient(updatedStock, 'Egg', 1 * qty);
          updatedStock = deductIngredient(updatedStock, 'Garlic Rice', 1 * qty);
        } 
        else if (cartItem.item_name === 'Porksilog') {
          updatedStock = deductIngredient(updatedStock, 'Pork Chop (Portion)', 1 * qty);
          updatedStock = deductIngredient(updatedStock, 'Egg', 1 * qty);
          updatedStock = deductIngredient(updatedStock, 'Garlic Rice', 1 * qty);
        } 
        else if (cartItem.item_name === 'Iced Tea') {
          updatedStock = deductIngredient(updatedStock, 'Iced Tea', 1 * qty);
        } 
        else if (cartItem.item_name === 'Coke Mismo') {
          updatedStock = deductIngredient(updatedStock, 'Coke Mismo', 1 * qty);
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