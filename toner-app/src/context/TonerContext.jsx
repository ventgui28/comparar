import { createContext, useContext, useState, useEffect } from 'react';
import { saveFiles, loadFiles, getAliases, saveAlias, deleteAlias, deleteAliasesByTarget } from '../utils/db';

const TonerContext = createContext();

export const TonerProvider = ({ children }) => {
  const [activeFiles, setActiveFiles] = useState(null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('toner-cart')) || {});
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('toner-favorites')) || []);
  const [aliases, setAliases] = useState([]);

  useEffect(() => {
    loadFiles().then(setActiveFiles);
    getAliases().then(setAliases);
  }, []);

  useEffect(() => {
    localStorage.setItem('toner-cart', JSON.stringify(cart));
    localStorage.setItem('toner-favorites', JSON.stringify(favorites));
    if (activeFiles !== null) saveFiles(activeFiles);
  }, [cart, favorites, activeFiles]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => {
      const isNowFavorite = !prev.includes(productId);
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

  const addManualAlias = async (sourceId, targetId, targetName) => {
    await saveAlias(sourceId, targetId, targetName);
    const updated = await getAliases();
    setAliases(updated);
  };

  const removeManualAlias = async (sourceId) => {
    await deleteAlias(sourceId);
    const updated = await getAliases();
    setAliases(updated);
  };

  const removeManualGroup = async (targetId) => {
    await deleteAliasesByTarget(targetId);
    const updated = await getAliases();
    setAliases(updated);
  };

  const value = { 
    activeFiles, 
    setActiveFiles, 
    cart, 
    setCart, 
    favorites, 
    setFavorites, 
    toggleFavorite, 
    addToCart, 
    updateCart, 
    aliases,
    addManualAlias,
    removeManualGroup,
    removeManualAlias
  };
  return <TonerContext.Provider value={value}>{children}</TonerContext.Provider>;
};

export const useToner = () => useContext(TonerContext);
