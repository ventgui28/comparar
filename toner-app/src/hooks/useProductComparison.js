import { useMemo } from 'react';
import { groupAndCompareProducts } from '../utils/productUtils';

export const useProductComparison = (activeFiles, debouncedSearch, favorites = [], priceHistory = {}) => {
  return useMemo(() => {
    return groupAndCompareProducts(activeFiles, debouncedSearch, favorites, priceHistory);
  }, [activeFiles, debouncedSearch, favorites, priceHistory]);
};
