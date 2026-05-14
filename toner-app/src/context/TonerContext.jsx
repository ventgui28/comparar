import { createContext, useContext, useState, useEffect } from 'react';
import { saveFiles, loadFiles, getAliases, saveAlias, deleteAlias, deleteAliasesByTarget, clearGranularData } from '../utils/db';

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
    if (Object.keys(cart).length > 0) {
      localStorage.setItem('toner-cart', JSON.stringify(cart));
    }
    if (favorites.length > 0) {
      localStorage.setItem('toner-favorites', JSON.stringify(favorites));
    }
    if (activeFiles !== null && activeFiles.length > 0) saveFiles(activeFiles);
  }, [cart, favorites, activeFiles]);

  const granularReset = async (options) => {
    // 1. Limpar IndexedDB
    await clearGranularData(options);

    // 2. Limpar LocalStorage e atualizar estado do React
    if (options.files) {
      setActiveFiles([]);
      // Ficheiros implica reset do Carrinho
      options.cart = true;
    }
    
    if (options.cart) {
      setCart({});
      localStorage.removeItem('toner-cart');
    }

    if (options.favorites) {
      setFavorites([]);
      localStorage.removeItem('toner-favorites');
    }

    if (options.aliases) {
      setAliases([]);
    }
  };

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
    
    // Migrate cart if source item is present
    setCart(prev => {
      if (prev[sourceId]) {
        const next = { ...prev };
        const sourceQty = next[sourceId].qty;
        const sourceShopId = next[sourceId].shopId;
        delete next[sourceId];
        
        next[targetId] = {
          qty: (next[targetId]?.qty || 0) + sourceQty,
          shopId: next[targetId]?.shopId || sourceShopId
        };
        return next;
      }
      return prev;
    });
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
    setAliases,
    addManualAlias,
    removeManualGroup,
    removeManualAlias,
    granularReset
  };
  return <TonerContext.Provider value={value}>{children}</TonerContext.Provider>;
};

export const useToner = () => useContext(TonerContext);
