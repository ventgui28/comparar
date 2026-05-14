export const useAppActions = (addToCart, addToast, onCartOpen) => {
  const handleAddToCart = (id, qty, shopId) => {
    addToCart(id, qty, shopId);
    if (addToast) {
      addToast('Adicionado ao carrinho!', 'success', {
        action: { label: 'Ver Carrinho', icon: 'cart' },
        onAction: () => onCartOpen && onCartOpen(true)
      });
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
