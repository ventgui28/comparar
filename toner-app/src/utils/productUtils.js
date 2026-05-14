import { calculateTrend } from './stats/priceTrend';
import { getProductKey, normalizeReference, normalizeDescription } from './normalization';

/**
 * Groups products from multiple files, calculates trends, and filters based on search term.
 * 
 * @param {Array} activeFiles - List of files with their data
 * @param {string} searchTerm - Search string to filter products
 * @param {Array} favorites - List of favorite product IDs
 * @param {Object} priceHistory - Map of product IDs to their price history
 * @returns {Array} Processed and filtered product list
 */
export const groupAndCompareProducts = (activeFiles, searchTerm, favorites = [], priceHistory = {}) => {
  if (!activeFiles || activeFiles.length === 0) return [];

  const s = searchTerm ? searchTerm.toLowerCase() : '';
  const isSearchEmpty = !s;
  const masterMap = new Map();
  
  // Mapping to track relationships between references and names
  const refToKey = new Map();
  const nameToKey = new Map();

  activeFiles.forEach(file => {
    file.data.forEach(item => {
      const matchesRef = item.ref && String(item.ref).toLowerCase().includes(s);
      const matchesDesc = item.desc && String(item.desc).toLowerCase().includes(s);
      
      if (isSearchEmpty || matchesRef || matchesDesc) {
        const normRef = normalizeReference(item.ref);
        const normName = normalizeDescription(item.desc);
        
        // Find existing key by reference or name
        let key = (normRef && refToKey.get(normRef)) || (normName && nameToKey.get(normName));
        
        if (!key) {
          // New product group - prioritize ref as ID if available, otherwise name
          key = normRef || normName || `unnamed-${Math.random()}`;
          if (normRef) refToKey.set(normRef, key);
          if (normName) nameToKey.set(normName, key);
          
          masterMap.set(key, { 
            id: key,
            desc: item.desc || 'Item sem descrição', 
            prices: {}, 
            refs: {},
            rowNumbers: {}
          });
        } else {
          // Update cross-mappings for hybrid matching
          if (normRef && !refToKey.has(normRef)) refToKey.set(normRef, key);
          if (normName && !nameToKey.has(normName)) nameToKey.set(normName, key);
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
      .map(item => {
        const prices = Object.values(item.prices);
        const delta = prices.length > 1 ? Math.max(...prices) - Math.min(...prices) : 0;
        return { ...item, delta };
      })
      .sort((a, b) => {
        const aFav = favorites.includes(a.id);
        const bFav = favorites.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        
        // Prioritize items with comparisons (delta > 0)
        if (a.delta > 0 && b.delta === 0) return -1;
        if (a.delta === 0 && b.delta > 0) return 1;
        
        // Then sort by delta amount
        if (a.delta !== b.delta) return b.delta - a.delta;
        
        // Finally alphabetize by description
        return a.desc.localeCompare(b.desc);
      });
  }

  return results;
};
