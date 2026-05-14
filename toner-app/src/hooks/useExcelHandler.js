import { useState } from 'react';
import { readRawExcel, parseWithMapping } from '../utils/excelParser';

export const useExcelHandler = (setActiveFiles, clearCart, addToast) => {
  const [showMapper, setShowMapper] = useState(null);
  const [fileQueue, setFileQueue] = useState([]);

  const checkNewDay = () => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('toner-last-upload-date');
    
    if (lastDate && lastDate !== today) {
      setActiveFiles([]);
      if (typeof clearCart === 'function') clearCart();
      if (typeof addToast === 'function') {
        addToast("Novo dia detectado. Dados limpos automaticamente.", "info");
      }
    }
    
    localStorage.setItem('toner-last-upload-date', today);
  };

  const processFile = async (file) => {
    if (!file) return;
    try {
      const excelBundle = await readRawExcel(file);
      setShowMapper({ fileName: file.name, excelBundle });
    } catch (err) {
      console.error(err);
      alert(`Erro ao processar ${file.name}`);
      // Process next in queue if this one fails
      processNextInQueue();
    }
  };

  const processNextInQueue = (currentQueue = []) => {
    const remaining = currentQueue.length > 0 ? currentQueue : fileQueue;
    if (remaining.length > 0) {
      const nextFile = remaining[0];
      const nextQueue = remaining.slice(1);
      setFileQueue(nextQueue);
      processFile(nextFile);
    }
  };

  const handleFiles = async (files) => {
    checkNewDay();
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (!showMapper) {
      // Start processing immediately
      const first = fileList[0];
      const rest = fileList.slice(1);
      setFileQueue(rest);
      await processFile(first);
    } else {
      // Add all to queue
      setFileQueue(prev => [...prev, ...fileList]);
    }
  };

  const handleFileDrop = async (event) => {
    await handleFiles(event.target.files);
    event.target.value = '';
  };

  const handleMappingConfirm = (mapping, rows) => {
    const parsed = parseWithMapping(rows, mapping, showMapper.fileName);
    
    setActiveFiles(prev => [
      ...(prev || []).filter(f => f.name !== showMapper.fileName), 
      { id: Date.now(), name: showMapper.fileName, data: parsed, mapping }
    ]);
    
    setShowMapper(null);
    // Trigger next file in queue
    setTimeout(() => processNextInQueue(), 100);
  };

  return {
    showMapper,
    setShowMapper,
    handleFiles,
    handleFileDrop,
    handleMappingConfirm
  };
};
