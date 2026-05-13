import { useState, useMemo, useCallback } from 'react';

const INITIAL_SELECTIONS = {
  ref: { start: null, end: null },
  name: { start: null, end: null },
  price: { start: null, end: null }
};

export const useMappingState = (sheetNames, sheetsData) => {
  const [selectedSheet, setSelectedSheet] = useState(sheetNames[0]);
  const [activeSlot, setActiveSlot] = useState('ref');
  const [ignoredRows, setIgnoredRows] = useState(new Set());
  const [selections, setSelections] = useState(INITIAL_SELECTIONS);

  const currentData = useMemo(() => sheetsData[selectedSheet] || [], [sheetsData, selectedSheet]);

  const filteredData = useMemo(() => {
    return currentData.filter((_, idx) => !ignoredRows.has(idx));
  }, [currentData, ignoredRows]);

  const resetSelections = useCallback(() => {
    setSelections(INITIAL_SELECTIONS);
    setIgnoredRows(new Set());
  }, []);

  const handleSheetChange = useCallback((sheetName) => {
    setSelectedSheet(sheetName);
    resetSelections();
  }, [resetSelections]);

  const toggleIgnoreRow = useCallback((idx) => {
    setIgnoredRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const handleCellClick = useCallback((rowIndex, colIndex) => {
    setSelections(prev => {
      const activeSlotData = prev[activeSlot];
      
      // Se clicar na mesma célula já selecionada (start ou end), desmarcar o slot
      if ((activeSlotData.start?.r === rowIndex && activeSlotData.start?.c === colIndex) || 
          (activeSlotData.end?.r === rowIndex && activeSlotData.end?.c === colIndex)) {
        return { ...prev, [activeSlot]: { start: null, end: null } };
      }

      const slots = ['ref', 'name', 'price'];
      const currentSlotIndex = slots.indexOf(activeSlot);
      
      // Verificar se a coluna já está ocupada por outro slot
      const occupiedSlot = slots.find(s => s !== activeSlot && prev[s].start?.c === colIndex);
      
      if (occupiedSlot) {
        setActiveSlot(occupiedSlot);
        return prev;
      }

      // Lógica de avanço automático de slot se clicar em nova coluna quando o atual já tem start
      let targetSlot = activeSlot;
      if (prev[activeSlot].start && prev[activeSlot].start.c !== colIndex) {
        const nextSlot = slots[currentSlotIndex + 1];
        if (nextSlot) {
          setActiveSlot(nextSlot);
          targetSlot = nextSlot;
        }
      }

      const slot = prev[targetSlot];
      if (!slot.start) {
        return { ...prev, [targetSlot]: { start: { r: rowIndex, c: colIndex }, end: null } };
      } else {
        // Se a coluna for diferente da inicial, mas targetSlot for o mesmo (ex: último slot)
        // ou se for a mesma coluna, definir o end
        if (slot.start.c === colIndex) {
            return { ...prev, [targetSlot]: { ...slot, end: { r: rowIndex, c: colIndex } } };
        }
        return prev;
      }
    });
  }, [activeSlot]);

  return {
    selectedSheet,
    setSelectedSheet,
    activeSlot,
    setActiveSlot,
    selections,
    ignoredRows,
    currentData,
    filteredData,
    toggleIgnoreRow,
    handleCellClick,
    handleSheetChange,
    resetSelections
  };
};

export default useMappingState;
