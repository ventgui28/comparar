import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import useMappingState from '../../hooks/useMappingState';

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

  it('deve inicializar com valores padrão', () => {
    const { result } = renderHook(() => useMappingState(sheetNames, sheetsData));

    expect(result.current.selectedSheet).toBe('Sheet1');
    expect(result.current.activeSlot).toBe('ref');
    expect(result.current.selections.ref).toEqual({ start: null, end: null });
    expect(result.current.ignoredRows.size).toBe(0);
    expect(result.current.currentData).toEqual(sheetsData['Sheet1']);
  });

  it('deve mudar a folha selecionada e limpar estados', () => {
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
});
