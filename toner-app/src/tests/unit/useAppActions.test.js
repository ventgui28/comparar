import { describe, it, expect, vi } from 'vitest';
import { useAppActions } from '../../hooks/useAppActions';

describe('useAppActions', () => {
  it('should call addToCart and addToast with action when handleAddToCart is called', () => {
    const addToCart = vi.fn();
    const addToast = vi.fn();
    const onCartOpen = vi.fn();
    
    const { handleAddToCart } = useAppActions(addToCart, addToast, onCartOpen);
    
    handleAddToCart('prod1', 2, 'shop1');
    
    expect(addToCart).toHaveBeenCalledWith('prod1', 2, 'shop1');
    expect(addToast).toHaveBeenCalledWith(
      'Adicionado ao carrinho!', 
      'success',
      expect.objectContaining({
        action: expect.objectContaining({ label: 'Ver Carrinho', icon: 'cart' }),
        onAction: expect.any(Function)
      })
    );
    
    // Test onAction
    const options = addToast.mock.calls[0][2];
    options.onAction();
    expect(onCartOpen).toHaveBeenCalledWith(true);
  });
});
