import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExcelHandler } from '../../hooks/useExcelHandler';

// Mock the excelParser since we're testing the hook logic, not the parsing
vi.mock('../../utils/excelParser', () => ({
  readRawExcel: vi.fn().mockResolvedValue({ sheetNames: [], sheetsData: {} }),
  parseWithMapping: vi.fn()
}));

describe('useExcelHandler - New Day Logic', () => {
  const setActiveFiles = vi.fn();
  const clearCart = vi.fn();
  const addToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should clear data when a new day is detected', async () => {
    // Set a "yesterday" date in localStorage
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    localStorage.setItem('toner-last-upload-date', yesterday.toDateString());

    const { result } = renderHook(() => useExcelHandler(setActiveFiles, clearCart, addToast));

    const mockFile = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    await act(async () => {
      await result.current.handleFiles([mockFile]);
    });

    expect(setActiveFiles).toHaveBeenCalledWith([]);
    expect(clearCart).toHaveBeenCalled();
    expect(addToast).toHaveBeenCalledWith(
      "Novo dia detectado. Dados limpos automaticamente.",
      "info"
    );
    expect(localStorage.getItem('toner-last-upload-date')).toBe(new Date().toDateString());
  });

  it('should not clear data when upload is on the same day', async () => {
    const today = new Date().toDateString();
    localStorage.setItem('toner-last-upload-date', today);

    const { result } = renderHook(() => useExcelHandler(setActiveFiles, clearCart, addToast));

    const mockFile = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    await act(async () => {
      await result.current.handleFiles([mockFile]);
    });

    expect(setActiveFiles).not.toHaveBeenCalledWith([]);
    expect(clearCart).not.toHaveBeenCalled();
    expect(localStorage.getItem('toner-last-upload-date')).toBe(today);
  });
});
