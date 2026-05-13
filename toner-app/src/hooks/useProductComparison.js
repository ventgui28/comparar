import { useMemo } from 'react';
import { calculateTrend } from '../utils/stats/priceTrend';
import { normalizeReference, normalizeDescription, getProductKey } from '../utils/normalization';

export const useProductComparison = (activeFiles, debouncedSearch, favorites = [], priceHistory = {}) => {
  return useMemo(() => {
    if (!activeFiles || activeFiles.length === 0) return [];

    const s = debouncedSearch.toLowerCase();
    const isSearchEmpty = !s;
    const masterMap = new Map();

    activeFiles.forEach(file => {
      file.data.forEach(item => {
        const matchesRef = item.ref && item.ref.toLowerCase().includes(s);
        const matchesDesc = item.desc && item.desc.toLowerCase().includes(s);
        
        if (isSearchEmpty || matchesRef || matchesDesc) {
          const key = getProductKey(item);
          
          if (!masterMap.has(key)) {
            masterMap.set(key, { 
              id: key,
              desc: item.desc || 'Item sem descrição', 
              prices: {}, 
              refs: {},
              rowNumbers: {}
            });
          }
          
          const entry = masterMap.get(key);
          entry.prices[file.id] = item.price;
          entry.refs[file.id] = item.ref;
          entry.rowNumbers[file.id] = item.rowIdx;
        }
      });
    });

    let results = Array.from(masterMap.values()).map(item => {
      const history = priceHistory[item.id];
      const prices = Object.values(item.prices);
      const currentPrice = Math.min(...prices);
      const trend = calculateTrend(currentPrice, history);
      return { ...item, trend };
    });

    if (isSearchEmpty) {
      results = results
        .filter(item => Object.keys(item.prices).length > 1)
        .map(item => {
          const prices = Object.values(item.prices);
          const delta = Math.max(...prices) - Math.min(...prices);
          return { ...item, delta };
        })
        .sort((a, b) => {
          const aFav = favorites.includes(a.id);
          const bFav = favorites.includes(b.id);
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return b.delta - a.delta;
        })
        .slice(0, 50);
    }

    return results;
  }, [activeFiles, debouncedSearch, favorites, priceHistory]);
};
