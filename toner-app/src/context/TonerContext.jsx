import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveFiles, loadFiles } from '../utils/db';

const TonerContext = createContext();

export const TonerProvider = ({ children }) => {
  const [activeFiles, setActiveFiles] = useState(null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('toner-cart')) || {});
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('toner-favorites')) || []);

  useEffect(() => {
    loadFiles().then(setActiveFiles);
  }, []);

  useEffect(() => {
    localStorage.setItem('toner-cart', JSON.stringify(cart));
    localStorage.setItem('toner-favorites', JSON.stringify(favorites));
    if (activeFiles !== null) saveFiles(activeFiles);
  }, [cart, favorites, activeFiles]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const addToCart = (productId, qty) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + qty
    }));
  };

  const updateCart = (productId, qty) => {
    setCart(prev => ({
      ...prev,
      [productId]: qty
    }));
  };

  const value = { activeFiles, setActiveFiles, cart, setCart, favorites, setFavorites, toggleFavorite, addToCart, updateCart };
  return <TonerContext.Provider value={value}>{children}</TonerContext.Provider>;
};

export const useToner = () => useContext(TonerContext);
