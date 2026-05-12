import { useMemo } from 'react';

export const useProductComparison = (activeFiles, debouncedSearch) => {
  return useMemo(() => {
    if (activeFiles.length === 0) return [];

    const s = debouncedSearch.toLowerCase();
    const isSearchEmpty = !s;
    const masterMap = new Map();

    activeFiles.forEach(file => {
      file.data.forEach(item => {
        const matchesRef = item.ref.toLowerCase().includes(s);
        const matchesDesc = item.desc && item.desc.toLowerCase().includes(s);
        
        if (isSearchEmpty || matchesRef || matchesDesc) {
          const key = item.desc.trim().toLowerCase() || item.ref.trim().toLowerCase();
          
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

    let results = Array.from(masterMap.values());

    if (isSearchEmpty) {
      results = results
        .filter(item => Object.keys(item.prices).length > 1)
        .map(item => {
          const prices = Object.values(item.prices);
          const delta = Math.max(...prices) - Math.min(...prices);
          return { ...item, delta };
        })
        .sort((a, b) => b.delta - a.delta)
        .slice(0, 50);
    }

    return results;
  }, [activeFiles, debouncedSearch]);
};
