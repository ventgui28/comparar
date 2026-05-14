import { calculateTrend } from './stats/priceTrend';
import { getProductKey, normalizeReference, normalizeDescription } from './normalization';

/**
 * Groups products from multiple files, calculates trends, and filters based on search term.
 * 
 * @param {Array} activeFiles - List of files with their data
 * @param {string} searchTerm - Search string to filter products
 * @param {Array} favorites - List of favorite product IDs
 * @param {Object} priceHistory - Map of product IDs to their price history
 * @param {Array} manualAliases - List of user-defined product merges
 * @returns {Array} Processed and filtered product list
 */
export const groupAndCompareProducts = (activeFiles, searchTerm, favorites = [], priceHistory = {}, manualAliases = []) => {
  if (!activeFiles || activeFiles.length === 0) return [];

  const s = searchTerm ? searchTerm.toLowerCase() : '';
  const isSearchEmpty = !s;
  const masterMap = new Map();
  
  // Mapping to track relationships between references and names
  const refToKey = new Map();
  const nameToKey = new Map();
  
  const aliasMap = new Map(manualAliases.map(a => [a.sourceId, a]));

  activeFiles.forEach(file => {
    file.data.forEach(item => {
      const matchesRef = item.ref && String(item.ref).toLowerCase().includes(s);
      const matchesDesc = item.desc && String(item.desc).toLowerCase().includes(s);
      
      if (isSearchEmpty || matchesRef || matchesDesc) {
        const normRef = normalizeReference(item.ref);
        const normName = normalizeDescription(item.desc);
        
        // Initial candidate key - check automated matching first
        let key = (normName && nameToKey.get(normName)) || (normRef && refToKey.get(normRef));
        
        if (!key) {
          // Fallback to natural key (Prioritize Name to match getProductKey)
          key = normName || normRef || `unnamed-${Math.random()}`;
        }

        // Apply manual alias redirection
        const alias = aliasMap.get(key);
        let currentDesc = item.desc || 'Item sem descrição';
        
        if (alias) {
          key = alias.targetId;
          currentDesc = alias.targetName;
        }
        
        if (!masterMap.has(key)) {
          masterMap.set(key, { 
            id: key,
            desc: currentDesc, 
            prices: {}, 
            refs: {},
            rowNumbers: {}
          });
          
          // Set mappings to this new group
          if (normRef) refToKey.set(normRef, key);
          if (normName) nameToKey.set(normName, key);
        } else {
          // Update cross-mappings for hybrid matching
          if (normRef && !refToKey.has(normRef)) refToKey.set(normRef, key);
          if (normName && !nameToKey.has(normName)) nameToKey.set(normName, key);
          
          // Ensure if it's an alias target, we use the preferred name
          if (alias) {
            masterMap.get(key).desc = alias.targetName;
          }
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
