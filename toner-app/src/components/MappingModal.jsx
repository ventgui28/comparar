import React, { useState, useMemo } from 'react';
import { Search, Eye, EyeOff, Trash2 } from 'lucide-react';

const MappingModal = ({ excelBundle, onConfirm, onCancel, fileName }) => {
  const { sheetNames, sheetsData } = excelBundle;
  const [selectedSheet, setSelectedSheet] = useState(sheetNames[0]);
  const [step, setStep] = useState(0); 
  const [debugSearch, setDebugSearch] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [ignoredRows, setIgnoredRows] = useState(new Set());
  
  const [selections, setSelections] = useState({
    nameStart: null, nameEnd: null, refStart: null, refEnd: null, priceStart: null, priceEnd: null
  });

  const currentData = sheetsData[selectedSheet] || [];
  
  // Filtramos as linhas que o utilizador quer ignorar manualmente
  const filteredData = useMemo(() => {
    return currentData.filter((_, idx) => !ignoredRows.has(idx));
  }, [currentData, ignoredRows]);

  const previewRows = filteredData.slice(0, 200); 
  const maxCols = Math.max(...previewRows.map(row => (row ? row.length : 0)), 0);
  const colIndices = Array.from({ length: maxCols }, (_, i) => i);

  const toggleIgnoreRow = (idx) => {
    const newIgnored = new Set(ignoredRows);
    if (newIgnored.has(idx)) newIgnored.delete(idx);
    else newIgnored.add(idx);
    setIgnoredRows(newIgnored);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    const currentStepKey = ['nameStart', 'nameEnd', 'refStart', 'refEnd', 'priceStart', 'priceEnd'][step];
    const newSelections = { ...selections, [currentStepKey]: { r: rowIndex, c: colIndex } };
    setSelections(newSelections);

    if (step < 5) setStep(step + 1);
    else {
      const mapping = {
        desc: newSelections.nameStart.c,
        ref: newSelections.refStart.c,
        price: newSelections.priceStart.c,
        startRow: Math.min(newSelections.nameStart.r, newSelections.refStart.r, newSelections.priceStart.r),
        endRow: Math.max(newSelections.nameEnd.r, newSelections.refEnd.r, newSelections.priceEnd.r) + 1
      };
      // Passamos apenas as linhas que não foram ignoradas
      onConfirm(mapping, filteredData);
    }
  };

  const getCellClass = (r, c) => {
    if (selections.nameStart?.r === r && selections.nameStart?.c === c) return 'cell-selected name';
    if (selections.nameEnd?.r === r && selections.nameEnd?.c === c) return 'cell-selected name';
    if (selections.refStart?.r === r && selections.refStart?.c === c) return 'cell-selected ref';
    if (selections.refEnd?.r === r && selections.refEnd?.c === c) return 'cell-selected ref';
    if (selections.priceStart?.r === r && selections.priceStart?.c === c) return 'cell-selected price';
    if (selections.priceEnd?.r === r && selections.priceEnd?.c === c) return 'cell-selected price';
    return '';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in">
        <div className="wizard-header">
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>FOLHA</label>
              <select className="pill" value={selectedSheet} onChange={(e) => { setSelectedSheet(e.target.value); setStep(0); setIgnoredRows(new Set()); }}>
                {sheetNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <button onClick={() => setShowRaw(!showRaw)} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {showRaw ? <EyeOff size={14}/> : <Eye size={14}/>} {showRaw ? 'Ver Tabela' : 'Ver Dados Brutos'}
            </button>
          </div>

          {!showRaw && (
            <>
              <span className="step-badge">Passo {step + 1} de 6</span>
              <h2 className="step-instruction">{[
                'Clica no PRIMEIRO NOME real', 'Clica no ÚLTIMO NOME real',
                'Clica na PRIMEIRA REFERÊNCIA real', 'Clica na ÚLTIMA REFERÊNCIA real',
                'Clica no PRIMEIRO PREÇO real', 'Clica no ÚLTIMO PREÇO real'
              ][step]}</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dica: Podes clicar no <Trash2 size={10}/> para esconder linhas de lixo.</p>
            </>
          )}
        </div>

        <div className="preview-container">
          {showRaw ? (
            <div style={{ padding: '2rem', background: '#18181b', color: '#10b981', fontFamily: 'monospace', fontSize: '0.8rem', overflow: 'auto', height: '100%' }}>
              <pre>{JSON.stringify(currentData.slice(0, 300), null, 2)}</pre>
            </div>
          ) : (
            <table className="preview-table clickable">
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, zIndex: 10, background: '#f8fafc' }}>#</th>
                  {colIndices.map(i => <th key={i}>{String.fromCharCode(65 + i)}</th>)}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td 
                      onClick={() => toggleIgnoreRow(rIdx)}
                      className="row-number-btn"
                      style={{ position: 'sticky', left: 0, zIndex: 5, background: '#f8fafc', fontWeight: 800, cursor: 'pointer' }}
                    >
                      <Trash2 size={12} style={{ marginRight: '4px' }} />
                      {row.__rowIdx}
                    </td>
                    {colIndices.map(cIdx => (
                      <td key={cIdx} className={getCellClass(rIdx, cIdx)} onClick={() => handleCellClick(rIdx, cIdx)}>
                        {row && row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
          {!showRaw && step > 0 && <button className="btn-cancel" onClick={() => setStep(step - 1)}>Voltar</button>}
        </div>
      </div>
    </div>
  );
};

export default MappingModal;
