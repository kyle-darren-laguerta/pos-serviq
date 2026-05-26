import React, { createContext, useEffect, useState } from 'react';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [addons, setAddons] = useState([]);
  const [menuError, setMenuError] = useState('');
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingAddons, setIsLoadingAddons] = useState(false);

  const fetchMenuItems = async () => {
    setIsLoadingMenu(true);
    try {
      const response = await fetch('http://localhost:3000/menu/item');
      const result = await response.json();

      if (response.ok && result.success) {
        setMenuItems(result.data);
        setMenuError('');
      } else {
        setMenuError(result.message || 'Unable to load menu items');
      }
    } catch (error) {
      setMenuError('Could not connect to the server.');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const fetchAddons = async () => {
    setIsLoadingAddons(true);
    try {
      const response = await fetch('http://localhost:3000/menu/addon');
      const result = await response.json();

      if (response.ok && result.success) {
        setAddons(result.data);
        setMenuError('');
      } else {
        setMenuError(result.message || 'Unable to load addons');
      }
    } catch (error) {
      setMenuError('Could not connect to the server.');
    } finally {
      setIsLoadingAddons(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchAddons();
  }, []);

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        addons,
        fetchMenuItems,
        fetchAddons,
        menuError,
        isLoadingMenu,
        isLoadingAddons,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};
