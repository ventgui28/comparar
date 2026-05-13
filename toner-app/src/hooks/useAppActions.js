import { useState } from 'react';

const TOAST_DURATION_MS = 2000;

export const useAppActions = (addToCart) => {
  const [toast, setToast] = useState('');

  const handleAddToCart = (id, qty, shopId) => {
    addToCart(id, qty, shopId);
    setToast('Adicionado!');
    setTimeout(() => setToast(''), TOAST_DURATION_MS);
  };

  const handleResetTotal = () => {
    localStorage.clear();
    window.location.reload();
  };

  return {
    toast,
    handleAddToCart,
    handleResetTotal
  };
};
