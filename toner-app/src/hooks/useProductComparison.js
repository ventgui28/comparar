import { useMemo } from 'react';
import { groupAndCompareProducts } from '../utils/productUtils';

export const useProductComparison = (activeFiles, debouncedSearch, favorites, aliases) => {
  return useMemo(() => {
    return groupAndCompareProducts(activeFiles, debouncedSearch, favorites, aliases);
  }, [activeFiles, debouncedSearch, favorites, aliases]);
};
