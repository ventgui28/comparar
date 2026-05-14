import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useMappingState from '../../hooks/useMappingState';
import * as db from '../../utils/db';

vi.mock('../../utils/db', () => ({
  getProfiles: vi.fn(),
  deleteProfile: vi.fn(),
  initDB: vi.fn(),
  saveProfile: vi.fn(),
  saveFiles: vi.fn(),
  loadFiles: vi.fn()
}));

describe('useMappingState', () => {
  const sheetNames = ['Sheet1', 'Sheet2'];
  const sheetsData = {
    'Sheet1': [
      { 0: 'A1', 1: 'B1', 2: 'C1', __rowIdx: 1 },
      { 0: 'A2', 1: 'B2', 2: 'C2', __rowIdx: 2 },
      { 0: 'A3', 1: 'B3', 2: 'C3', __rowIdx: 3 },
    ],
    'Sheet2': [
      { 0: 'X1', 1: 'Y1', __rowIdx: 1 },
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    db.getProfiles.mockResolvedValue([]);
  });

  it('deve inicializar com valores padrão', async () => {
    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData, 'test.xlsx'));

    expect(result.current.selectedSheet).toBe('Sheet1');
    expect(result.current.activeSlot).toBe('ref');
    expect(result.current.selections.ref).toEqual({ start: null, end: null });
    expect(result.current.ignoredRows.size).toBe(0);
    expect(result.current.currentData).toEqual(sheetsData['Sheet1']);
  });

  it('deve carregar perfis e detetar correspondência pelo nome do ficheiro', async () => {
    const mockProfiles = [
      { name: 'FORNECEDOR_A', mapping: { ref: { start: { r: 1, c: 0 }, end: null }, name: { start: null, end: null }, price: { start: null, end: null } } }
    ];
    db.getProfiles.mockResolvedValue(mockProfiles);

    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData, 'FORNECEDOR_A_ABRIL.xlsx'));

    await waitFor(() => {
      expect(result.current.profiles).toEqual(mockProfiles);
    });

    expect(result.current.companyName).toBe('FORNECEDOR_A');
    expect(result.current.selections.ref.start).toEqual({ r: 1, c: 0 });
  });

  it('deve detetar perfil com diferentes capitalizações e posições no nome do ficheiro', async () => {
    const mockProfiles = [{ name: 'JMBento', mapping: { ref: { start: { r: 1, c: 1 }, end: null }, name: { start: null, end: null }, price: { start: null, end: null } } }];
    db.getProfiles.mockResolvedValue(mockProfiles);

    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData, 'tabela_jmbento_maio_2026.xlsx'));

    await waitFor(() => {
      expect(result.current.companyName).toBe('JMBento');
    });
    expect(result.current.selections.ref.start).toEqual({ r: 1, c: 1 });
  });

  it('deve eliminar perfil e atualizar estado', async () => {
    const mockProfiles = [{ name: 'FORNECEDOR_A', mapping: {} }];
    db.getProfiles.mockResolvedValueOnce(mockProfiles).mockResolvedValueOnce([]);
    db.deleteProfile.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData, 'FORNECEDOR_A.xlsx'));

    await waitFor(() => {
      expect(result.current.companyName).toBe('FORNECEDOR_A');
    });

    await act(async () => {
      await result.current.handleDeleteProfile('FORNECEDOR_A');
    });

    expect(db.deleteProfile).toHaveBeenCalledWith('FORNECEDOR_A');
    expect(result.current.profiles).toEqual([]);
    expect(result.current.companyName).toBe('');
  });

  it('deve mudar a folha selecionada e limpar estados', async () => {
    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData));

    act(() => {
      result.current.toggleIgnoreRow(1);
      result.current.handleCellClick(0, 0);
      result.current.setSelectedSheet('Sheet2');
    });

    // Note: handleSheetChange is explicitly mentioned in task, but setSelectedSheet is also used
    // If we use a custom handleSheetChange that resets state:
    act(() => {
        result.current.handleSheetChange('Sheet2');
    });

    expect(result.current.selectedSheet).toBe('Sheet2');
    expect(result.current.selections.ref.start).toBeNull();
    expect(result.current.ignoredRows.size).toBe(0);
  });

  it('deve alternar ignorar linha', () => {
    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData));

    act(() => {
      result.current.toggleIgnoreRow(1);
    });
    expect(result.current.ignoredRows.has(1)).toBe(true);
    expect(result.current.filteredData.length).toBe(2);

    act(() => {
      result.current.toggleIgnoreRow(1);
    });
    expect(result.current.ignoredRows.has(1)).toBe(false);
    expect(result.current.filteredData.length).toBe(3);
  });

  it('deve lidar com o clique na célula e seleção de slots', () => {
    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData));

    // Selecionar ref start
    act(() => {
      result.current.handleCellClick(0, 0); // Row 0, Col 0
    });
    expect(result.current.selections.ref.start).toEqual({ r: 0, c: 0 });

    // Selecionar ref end (mesma coluna)
    act(() => {
      result.current.handleCellClick(2, 0); // Row 2, Col 0
    });
    expect(result.current.selections.ref.end).toEqual({ r: 2, c: 0 });

    // Mudar para slot name automaticamente se clicar em outra coluna?
    // A lógica original no MappingModal parece fazer isso:
    // if (selections[activeSlot].start && selections[activeSlot].start.c !== colIndex) { ... }
    
    // Testar seleção de nome em outra coluna
    act(() => {
        result.current.setActiveSlot('name');
        result.current.handleCellClick(0, 1);
    });
    expect(result.current.selections.name.start).toEqual({ r: 0, c: 1 });
  });

  it('deve resetar seleções', () => {
    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData));

    act(() => {
      result.current.handleCellClick(0, 0);
      result.current.resetSelections();
    });

    expect(result.current.selections.ref.start).toBeNull();
  });

  it('deve selecionar um perfil manualmente e aplicar o mapeamento', async () => {
    const mockProfiles = [
      { name: 'FORNECEDOR_B', mapping: { ref: { start: { r: 5, c: 5 }, end: null }, name: { start: null, end: null }, price: { start: null, end: null } } }
    ];
    db.getProfiles.mockResolvedValue(mockProfiles);

    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData, 'unknown.xlsx'));

    await waitFor(() => {
      expect(result.current.profiles).toEqual(mockProfiles);
    });

    act(() => {
      result.current.handleProfileSelect('FORNECEDOR_B');
    });

    expect(result.current.companyName).toBe('FORNECEDOR_B');
    expect(result.current.selections.ref.start).toEqual({ r: 5, c: 5 });
  });
});
