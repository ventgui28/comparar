import { useState, useMemo, useCallback, useEffect } from 'react';
import { getProfiles, deleteProfile } from '../utils/db';

const INITIAL_SELECTIONS = {
  ref: { start: null, end: null },
  name: { start: null, end: null },
  price: { start: null, end: null }
};

export const useMappingState = (sheetNames, sheetsData, fileName) => {
  const [selectedSheet, setSelectedSheet] = useState(sheetNames[0]);
  const [activeSlot, setActiveSlot] = useState('ref');
  const [ignoredRows, setIgnoredRows] = useState(new Set());
  const [selections, setSelections] = useState(INITIAL_SELECTIONS);
  const [companyName, setCompanyName] = useState('');
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const all = await getProfiles();
      if (!active) return;
      setProfiles(all);
      if (fileName) {
        const match = all.find(p => fileName.toLowerCase().includes(p.name.toLowerCase()));
        if (match) {
          setCompanyName(match.name);
          setSelections(match.mapping);
        }
      }
    };
    load();
    return () => { active = false; };
  }, [fileName]);

  const handleDeleteProfile = useCallback(async (name) => {
    await deleteProfile(name);
    const all = await getProfiles();
    setProfiles(all);
    if (companyName === name) {
      setCompanyName('');
    }
  }, [companyName]);

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
    const slots = ['ref', 'name', 'price'];
    const activeSlotData = selections[activeSlot];
    
    // 1. Desmarcar se clicar na mesma célula
    if ((activeSlotData.start?.r === rowIndex && activeSlotData.start?.c === colIndex) || 
        (activeSlotData.end?.r === rowIndex && activeSlotData.end?.c === colIndex)) {
      setSelections(prev => ({ ...prev, [activeSlot]: { start: null, end: null } }));
      return;
    }

    // 2. Mudar de slot se clicar em coluna já ocupada
    const occupiedSlot = slots.find(s => s !== activeSlot && selections[s].start?.c === colIndex);
    if (occupiedSlot) {
      setActiveSlot(occupiedSlot);
      return;
    }

    // 3. Determinar o slot alvo (avanço automático)
    let targetSlot = activeSlot;
    if (activeSlotData.start && activeSlotData.start.c !== colIndex) {
      const currentSlotIndex = slots.indexOf(activeSlot);
      const nextSlot = slots[currentSlotIndex + 1];
      if (nextSlot) {
        targetSlot = nextSlot;
        setActiveSlot(nextSlot);
      } else {
        return; // Não avança além do último slot
      }
    }

    // 4. Aplicar seleção no slot alvo
    setSelections(prev => {
      const slot = prev[targetSlot];
      if (!slot.start) {
        return { ...prev, [targetSlot]: { start: { r: rowIndex, c: colIndex }, end: null } };
      } else if (slot.start.c === colIndex) {
        return { ...prev, [targetSlot]: { ...slot, end: { r: rowIndex, c: colIndex } } };
      }
      return prev;
    });
  }, [activeSlot, selections]);

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
    resetSelections,
    companyName,
    setCompanyName,
    profiles,
    handleDeleteProfile
  };
};

export default useMappingState;
