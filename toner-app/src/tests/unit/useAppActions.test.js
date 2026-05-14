import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppActions } from '../../hooks/useAppActions';
import { saveFiles } from '../../utils/db';

vi.mock('../../utils/db', () => ({
  saveFiles: vi.fn()
}));

describe('useAppActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.reload
    delete window.location;
    window.location = { reload: vi.fn() };
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        clear: vi.fn(),
      },
      writable: true
    });
  });

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

  it('should clear data and reload when handleResetTotal is called', async () => {
    const { handleResetTotal } = useAppActions();
    
    await handleResetTotal();
    
    expect(window.localStorage.clear).toHaveBeenCalled();
    expect(saveFiles).toHaveBeenCalledWith([]);
    expect(window.location.reload).toHaveBeenCalled();
  });
});
