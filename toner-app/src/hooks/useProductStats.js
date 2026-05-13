export const useProductStats = (item) => {
  const prices = Object.values(item.prices).filter(p => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const savings = maxPrice - minPrice;
  return { prices, minPrice, maxPrice, savings };
};
