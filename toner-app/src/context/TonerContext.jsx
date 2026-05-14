import { createContext, useContext, useState, useEffect } from 'react';
import { saveFiles, loadFiles, getPriceHistory, savePriceHistory, getAliases, saveAlias, deleteAlias } from '../utils/db';

const TonerContext = createContext();

export const TonerProvider = ({ children }) => {
  const [activeFiles, setActiveFiles] = useState(null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('toner-cart')) || {});
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('toner-favorites')) || []);
  const [priceHistory, setPriceHistory] = useState({});
  const [aliases, setAliases] = useState([]);

  useEffect(() => {
    loadFiles().then(setActiveFiles);
    getAliases().then(setAliases);
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
      return isNowFavorite ? [...prev, productId] : prev.filter(id => id !== productId);
    });

    const isAdding = !favorites.includes(productId);
    if (isAdding && activeFiles) {
      let bestPrice = Infinity;
      activeFiles.forEach(file => {
        const item = file.data.find(d => {
          const normalizeRef = (ref) => ref ? ref.toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '';
          const normalizeDesc = (text) => text ? text.toLowerCase().replace(/\(.*\)/g, '').replace(/\s+/g, ' ').trim() : '';
          return (normalizeRef(d.ref) || normalizeDesc(d.desc)) === productId;
        });
        if (item && item.price < bestPrice) bestPrice = item.price;
      });

      if (bestPrice !== Infinity) {
        savePriceHistory(productId, bestPrice, [productId]);
      }
    }
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
    priceHistory,
    aliases,
    addManualAlias,
    removeManualGroup,
    removeManualAlias
  };
  return <TonerContext.Provider value={value}>{children}</TonerContext.Provider>;
};

export const useToner = () => useContext(TonerContext);
