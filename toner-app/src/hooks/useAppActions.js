import { clearAllData } from '../utils/db';

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

  const handleResetTotal = async () => {
    localStorage.clear();
    await clearAllData();
    window.location.reload();
  };

  return {
    handleAddToCart,
    handleResetTotal
  };
};
