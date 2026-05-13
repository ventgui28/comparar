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
    let ignore = false;
    const fetchHistory = async () => {
      if (favorites.length === 0) {
        setPriceHistory({});
        return;
      }

      const histories = await Promise.all(
        favorites.map(async (id) => {
          const records = await getPriceHistory(id);
          return { id, records };
        })
      );

      if (ignore) return;

      const historyMap = {};
      histories.forEach(({ id, records }) => {
        if (records && records.length > 0) {
          historyMap[id] = { records };
        }
      });
      setPriceHistory(historyMap);
    };

    fetchHistory();
    return () => {
      ignore = true;
    };
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('toner-cart', JSON.stringify(cart));
    localStorage.setItem('toner-favorites', JSON.stringify(favorites));
    if (activeFiles !== null) saveFiles(activeFiles);
  }, [cart, favorites, activeFiles]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const isNowFavorite = !prev.includes(productId);
      
      // If adding to favorites, try to save current price to history immediately
      if (isNowFavorite && activeFiles) {
        // Find product in all active files to get current prices
        activeFiles.forEach(file => {
          const item = file.data.find(d => {
            const normalizeRef = (ref) => ref ? ref.toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '';
            const normalizeDesc = (text) => text ? text.toLowerCase().replace(/\(.*\)/g, '').replace(/\s+/g, ' ').trim() : '';
            const key = normalizeRef(d.ref) || normalizeDesc(d.desc);
            return key === productId;
          });
          
          if (item) {
            savePriceHistory(productId, item.price, [productId]); // Pass [productId] to bypass the "is it favorite" check
          }
        });
      }
      
      return isNowFavorite ? [...prev, productId] : prev.filter(id => id !== productId);
    });
  };

  const addToCart = (productId, qty, shopId) => {
    setCart(prev => ({
      ...prev,
      [productId]: { 
        qty: (prev[productId]?.qty || 0) + Number(qty), 
        shopId 
      }
    }));
  };

  const updateCart = (productId, qty) => {
    setCart(prev => {
      const next = { ...prev };
      if (Number(qty) <= 0) {
        delete next[productId];
      } else {
        next[productId] = { ...next[productId], qty: Number(qty) };
      }
      return next;
    });
  };

  const value = { activeFiles, setActiveFiles, cart, setCart, favorites, setFavorites, toggleFavorite, addToCart, updateCart, priceHistory };
  return <TonerContext.Provider value={value}>{children}</TonerContext.Provider>;
};

export const useToner = () => useContext(TonerContext);
