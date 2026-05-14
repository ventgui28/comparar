import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from '../../components/shared/Toast';

describe('Toast Component', () => {
  it('renders message correctly', () => {
    render(<Toast message="Test Message" onClose={() => {}} />);
    expect(screen.getByText('Test Message')).toBeDefined();
  });

  it('calls onClose after 5 seconds', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast message="Test Message" onClose={onClose} />);
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('renders with correct type class', () => {
    const { container } = render(<Toast message="Error Message" type="error" onClose={() => {}} />);
    const toastDiv = container.querySelector('.toast-card');
    expect(toastDiv.classList.contains('toast-error')).toBe(true);
  });

  it('renders action button when provided', () => {
    const onAction = vi.fn();
    render(
      <Toast 
        message="Action Message" 
        action={{ label: 'Undo', icon: 'undo' }} 
        onAction={onAction}
        onClose={() => {}} 
      />
    );
    const actionBtn = screen.getByText('Undo');
    expect(actionBtn).toBeDefined();
    
    actionBtn.click();
    expect(onAction).toHaveBeenCalled();
  });
});
