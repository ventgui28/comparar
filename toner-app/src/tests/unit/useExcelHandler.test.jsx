import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExcelHandler } from '../../hooks/useExcelHandler';
import * as excelParser from '../../utils/excelParser';
import * as db from '../../utils/db';

// Mock the excelParser since we're testing the hook logic, not the parsing
vi.mock('../../utils/excelParser', () => ({
  readRawExcel: vi.fn().mockResolvedValue({ 
    sheetNames: ['Sheet1'], 
    sheetsData: { 'Sheet1': [['header'], ['row1']] } 
  }),
  parseWithMapping: vi.fn().mockReturnValue([{ id: 1, name: 'Product 1' }])
}));

// Mock the db
vi.mock('../../utils/db', () => ({
  getProfiles: vi.fn().mockResolvedValue([])
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

describe('useExcelHandler - Silent Auto-Mapping', () => {
  const setActiveFiles = vi.fn();
  const clearCart = vi.fn();
  const addToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should auto-map if filename matches a profile name', async () => {
    const mockProfile = {
      name: 'Fornecedor A',
      mapping: { sku: 0, price: 1 }
    };
    vi.mocked(db.getProfiles).mockResolvedValue([mockProfile]);

    const { result } = renderHook(() => useExcelHandler(setActiveFiles, clearCart, addToast));

    const mockFile = new File([''], 'Fornecedor A - Abril.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    await act(async () => {
      await result.current.handleFiles([mockFile]);
    });

    // Should not show mapper
    expect(result.current.showMapper).toBeNull();
    
    // Should have called setActiveFiles with parsed data
    expect(setActiveFiles).toHaveBeenCalled();
    const callArgs = setActiveFiles.mock.calls[0][0]([]);
    expect(callArgs[0]).toMatchObject({
      name: 'Fornecedor A - Abril.xlsx',
      mapping: mockProfile.mapping
    });

    // Should show success toast
    expect(addToast).toHaveBeenCalledWith(
      'Importado automaticamente: Fornecedor A',
      'success'
    );
  });

  it('should show mapper if no profile matches', async () => {
    vi.mocked(db.getProfiles).mockResolvedValue([{ name: 'Outro' }]);

    const { result } = renderHook(() => useExcelHandler(setActiveFiles, clearCart, addToast));

    const mockFile = new File([''], 'Desconhecido.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    await act(async () => {
      await result.current.handleFiles([mockFile]);
    });

    // Should show mapper
    expect(result.current.showMapper).not.toBeNull();
    expect(result.current.showMapper.fileName).toBe('Desconhecido.xlsx');
    
    // Should NOT have called setActiveFiles yet
    expect(setActiveFiles).not.toHaveBeenCalled();
  });
});
