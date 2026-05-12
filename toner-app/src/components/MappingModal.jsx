import React, { useState, useMemo } from 'react';
import { Search, Eye, EyeOff, Trash2, Check } from 'lucide-react';

const MappingModal = ({ excelBundle, onConfirm, onCancel, fileName }) => {
  const { sheetNames, sheetsData } = excelBundle;
  const [selectedSheet, setSelectedSheet] = useState(sheetNames[0]);
  const [step, setStep] = useState(0); 
  const [debugSearch, setDebugSearch] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [ignoredRows, setIgnoredRows] = useState(new Set());
  
  const [selections, setSelections] = useState({
    refStart: null, refEnd: null, nameStart: null, nameEnd: null, priceStart: null, priceEnd: null
  });

  const stepKeys = ['refStart', 'refEnd', 'nameStart', 'nameEnd', 'priceStart', 'priceEnd'];
  const stepLabels = [
    'Clique na PRIMEIRA REFERÊNCIA', 'Clique na ÚLTIMA REFERÊNCIA (opcional)',
    'Clique no PRIMEIRO NOME', 'Clique no ÚLTIMO NOME (opcional)',
    'Clique no PRIMEIRO PREÇO', 'Clique no ÚLTIMO PREÇO (opcional)'
  ];

  const currentData = sheetsData[selectedSheet] || [];
  
  const filteredData = useMemo(() => {
    return currentData.filter((_, idx) => !ignoredRows.has(idx));
  }, [currentData, ignoredRows]);

  const previewRows = currentData.slice(0, 200); 
  const maxCols = Math.max(...previewRows.map(row => (row ? row.length : 0)), 0);
  const colIndices = Array.from({ length: maxCols }, (_, i) => i);

  const toggleIgnoreRow = (idx) => {
    const newIgnored = new Set(ignoredRows);
    if (newIgnored.has(idx)) newIgnored.delete(idx);
    else newIgnored.add(idx);
    setIgnoredRows(newIgnored);
  };

  const handleCellClick = (rowIndex, colIndex) => {
    // 1. Toggle logic (Check if clicking an already selected cell to undo)
    const existingStepIndex = stepKeys.findIndex(key => 
      selections[key]?.r === rowIndex && selections[key]?.c === colIndex
    );

    if (existingStepIndex !== -1) {
      setSelections(prev => ({ ...prev, [stepKeys[existingStepIndex]]: null }));
      setStep(existingStepIndex);
      return;
    }

    // 2. Smart Category Switching logic
    const currentStepKey = stepKeys[step];
    const isEndStep = currentStepKey.endsWith('End');

    if (isEndStep) {
      const startStepKey = stepKeys[step - 1];
      const startSelection = selections[startStepKey];

      // If clicking a DIFFERENT column than the start, assume it's the next category
      if (startSelection && colIndex !== startSelection.c) {
        const nextStartKey = stepKeys[step + 1];
        if (nextStartKey) {
          setSelections(prev => ({ 
            ...prev, 
            [currentStepKey]: null, // Ensure End is null
            [nextStartKey]: { r: rowIndex, c: colIndex } 
          }));
          setStep(step + 2); // Jump to the next step after the next Start
          return;
        }
      }
    }

    // 3. Normal selection logic
    setSelections(prev => ({ ...prev, [currentStepKey]: { r: rowIndex, c: colIndex } }));

    if (step < 5) {
      setStep(step + 1);
    }
  };

  const getCellClass = (r, c) => {
    const classes = [];
    
    // Exact matches (Start/End)
    if (selections.refStart?.r === r && selections.refStart?.c === c) classes.push('cell-selected ref');
    if (selections.refEnd?.r === r && selections.refEnd?.c === c) classes.push('cell-selected ref');
    if (selections.nameStart?.r === r && selections.nameStart?.c === c) classes.push('cell-selected name');
    if (selections.nameEnd?.r === r && selections.nameEnd?.c === c) classes.push('cell-selected name');
    if (selections.priceStart?.r === r && selections.priceStart?.c === c) classes.push('cell-selected price');
    if (selections.priceEnd?.r === r && selections.priceEnd?.c === c) classes.push('cell-selected price');

    // Range highlights
    const checkRange = (start, end, className) => {
      if (!start) return;
      if (c === start.c && r >= start.r) {
        if (!end || r <= end.r) {
          classes.push(className);
        }
      }
    };

    checkRange(selections.refStart, selections.refEnd, 'range-ref');
    checkRange(selections.nameStart, selections.nameEnd, 'range-name');
    checkRange(selections.priceStart, selections.priceEnd, 'range-price');

    return classes.join(' ');
  };

  const canFinalize = selections.refStart && selections.nameStart && selections.priceStart;

  const handleFinalize = () => {
    if (!canFinalize) return;

    const allEndRows = [
      selections.refEnd?.r,
      selections.nameEnd?.r,
      selections.priceEnd?.r
    ].filter(r => r !== undefined && r !== null);

    const mapping = {
      ref: selections.refStart.c,
      desc: selections.nameStart.c,
      price: selections.priceStart.c,
      startRow: Math.min(selections.refStart.r, selections.nameStart.r, selections.priceStart.r),
      endRow: allEndRows.length > 0 ? Math.max(...allEndRows) + 1 : null
    };

    onConfirm(mapping, filteredData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in">
        <div className="wizard-header">
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>FOLHA</label>
              <select className="pill" value={selectedSheet} onChange={(e) => { setSelectedSheet(e.target.value); setStep(0); setSelections({ refStart: null, refEnd: null, nameStart: null, nameEnd: null, priceStart: null, priceEnd: null }); setIgnoredRows(new Set()); }}>
                {sheetNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <button onClick={() => setShowRaw(!showRaw)} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {showRaw ? <EyeOff size={14}/> : <Eye size={14}/>} {showRaw ? 'Ver Tabela' : 'Ver Dados Brutos'}
            </button>
          </div>

          {!showRaw && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <span className="step-badge">Passo {step + 1} de 6</span>
                {canFinalize && (
                  <span className="step-badge success" style={{ background: '#dcfce7', color: '#166534' }}>
                    Pronto para Confirmar
                  </span>
                )}
              </div>
              <h2 className="step-instruction">{stepLabels[step]}</h2>
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
                  <tr key={rIdx} className={ignoredRows.has(rIdx) ? 'ignored-row' : ''}>
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
          
          {canFinalize && (
            <button className="btn-primary" onClick={handleFinalize} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={18} /> Confirmar Mapeamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MappingModal;
