export const useAppActions = (addToCart, addToast) => {
  const handleAddToCart = (id, qty, shopId) => {
    addToCart(id, qty, shopId);
    if (addToast) {
      addToast('Adicionado ao carrinho!', 'success');
    }
  };

  const handleResetTotal = () => {
    localStorage.clear();
    window.location.reload();
  };

  return {
    handleAddToCart,
    handleResetTotal
  };
};
