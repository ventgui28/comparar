import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveFiles, loadFiles, getPriceHistory } from '../utils/db';

const TonerContext = createContext();

export const TonerProvider = ({ children }) => {
  const [activeFiles, setActiveFiles] = useState(null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('toner-cart')) || {});
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('toner-favorites')) || []);
  const [priceHistory, setPriceHistory] = useState({});

  useEffect(() => {
    loadFiles().then(setActiveFiles);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (favorites.length === 0) {
        setPriceHistory({});
        return;
      }
      const historyMap = {};
      for (const id of favorites) {
        const records = await getPriceHistory(id);
        if (records && records.length > 0) {
          historyMap[id] = { records };
        }
      }
      setPriceHistory(historyMap);
    };
    fetchHistory();
  }, [favorites]);

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

  const value = { activeFiles, setActiveFiles, cart, setCart, favorites, setFavorites, toggleFavorite, addToCart, updateCart, priceHistory };
  return <TonerContext.Provider value={value}>{children}</TonerContext.Provider>;
};

export const useToner = () => useContext(TonerContext);
