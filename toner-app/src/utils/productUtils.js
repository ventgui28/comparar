import { getProductKey, normalizeReference, normalizeDescription } from './normalization';

/**
 * Groups products from multiple files and filters based on search term.
 * 
 * @param {Array} activeFiles - List of files with their data
 * @param {string} searchTerm - Search string to filter products
 * @param {Array} favorites - List of favorite product IDs
 * @param {Array} manualAliases - List of user-defined product merges
 * @returns {Array} Processed and filtered product list
 */
export const groupAndCompareProducts = (activeFiles, searchTerm, favorites = [], manualAliases = []) => {
  if (!activeFiles || activeFiles.length === 0) return [];

  const masterMap = new Map();
  const refToKey = new Map();
  const nameToKey = new Map();
  const aliasMap = new Map(manualAliases.map(a => [a.sourceId, a]));

  // 1. Group EVERYTHING first
  activeFiles.forEach(file => {
    file.data.forEach(item => {
      const normRef = normalizeReference(item.ref);
      const normName = normalizeDescription(item.desc);
      
      // Candidate key check
      let key = (normName && nameToKey.get(normName)) || (normRef && refToKey.get(normRef));
      if (!key) {
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
        
        if (normRef) refToKey.set(normRef, key);
        if (normName) nameToKey.set(normName, key);
      } else {
        if (normRef && !refToKey.has(normRef)) refToKey.set(normRef, key);
        if (normName && !nameToKey.has(normName)) nameToKey.set(normName, key);
        if (alias) masterMap.get(key).desc = alias.targetName;
      }
      
      const entry = masterMap.get(key);
      entry.prices[file.id] = item.price;
      entry.refs[file.id] = item.ref;
      entry.rowNumbers[file.id] = item.rowIdx;
    });
  });

  // 2. Prepare for filtering
  let results = Array.from(masterMap.values());

  // 3. Apply search filter on groups
  if (searchTerm) {
    const s = searchTerm.toLowerCase();
    results = results.filter(item => {
      const matchesDesc = item.desc.toLowerCase().includes(s);
      const matchesRefs = Object.values(item.refs).some(r => r && String(r).toLowerCase().includes(s));
      return matchesDesc || matchesRefs;
    });
  }

  // 4. Sort (Favorites first, then Savings/Alphabetical)
  if (!searchTerm) {
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
        
        if (a.delta > 0 && b.delta === 0) return -1;
        if (a.delta === 0 && b.delta > 0) return 1;
        
        if (a.delta !== b.delta) return b.delta - a.delta;
        return a.desc.localeCompare(b.desc);
      });
  }

  return results;
};
