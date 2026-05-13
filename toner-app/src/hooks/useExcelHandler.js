import { useState } from 'react';
import { readRawExcel, parseWithMapping } from '../utils/excelParser';
import { savePriceHistory } from '../utils/db';
import { getProductKey } from '../utils/normalization';

export const useExcelHandler = (setActiveFiles, favorites) => {
  const [showMapper, setShowMapper] = useState(null);

  const handleFileDrop = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const excelBundle = await readRawExcel(file);
      setShowMapper({ fileName: file.name, excelBundle });
    } catch {
      alert('Erro no processamento.');
    } finally {
      event.target.value = '';
    }
  };

  const handleMappingConfirm = (mapping, rows) => {
    const parsed = parseWithMapping(rows, mapping, showMapper.fileName);
    
    parsed.forEach(item => {
      const key = getProductKey(item);
      savePriceHistory(key, item.price, favorites);
    });

    setActiveFiles(prev => [
      ...(prev || []).filter(f => f.name !== showMapper.fileName), 
      { id: Date.now(), name: showMapper.fileName, data: parsed, mapping }
    ]);
    setShowMapper(null);
  };

  return {
    showMapper,
    setShowMapper,
    handleFileDrop,
    handleMappingConfirm
  };
};
