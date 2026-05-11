import React, { createContext, useState, useContext, useEffect } from 'react';

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  // 1. Initialize state (usually an array for list data)
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Wrap fetch in useEffect so it runs once
    fetch('http://localhost:3000/food-package') // Note: check if it's http or https
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(result => {
        setPackages(result.data); // 3. Set the data directly
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []); // Empty dependency array means "run on mount"

  return (
    // 4. Passing loading state is often helpful for UI
    <InventoryContext.Provider value={{ packages, loading }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventoryContext = () => useContext(InventoryContext);