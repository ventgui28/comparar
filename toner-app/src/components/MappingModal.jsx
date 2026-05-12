import React, { useState, useMemo } from 'react';
import { Search, Eye, EyeOff, Trash2, Check } from 'lucide-react';

const MappingModal = ({ excelBundle, onConfirm, onCancel, fileName }) => {
  const { sheetNames, sheetsData } = excelBundle;
  const [selectedSheet, setSelectedSheet] = useState(sheetNames[0]);
  const [activeSlot, setActiveSlot] = useState('ref');
  const [debugSearch, setDebugSearch] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [ignoredRows, setIgnoredRows] = useState(new Set());
  
  const [selections, setSelections] = useState({
    ref: { start: null, end: null },
    name: { start: null, end: null },
    price: { start: null, end: null }
  });

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
    let targetSlot = activeSlot;
    
    // If no active slot, find next unmapped
    if (!targetSlot) {
      if (!selections.ref.start) targetSlot = 'ref';
      else if (!selections.name.start) targetSlot = 'name';
      else if (!selections.price.start) targetSlot = 'price';
    }

    if (!targetSlot) return;

    const slot = selections[targetSlot];

    // Toggle: if clicked cell is already the start or end, clear it
    if ((slot.start?.r === rowIndex && slot.start?.c === colIndex) || 
        (slot.end?.r === rowIndex && slot.end?.c === colIndex)) {
      setSelections(prev => ({ ...prev, [targetSlot]: { start: null, end: null } }));
      return;
    }

    // Set Start/End
    if (!slot.start) {
      setSelections(prev => ({ ...prev, [targetSlot]: { start: { r: rowIndex, c: colIndex }, end: null } }));
    } else {
      setSelections(prev => ({ ...prev, [targetSlot]: { ...slot, end: { r: rowIndex, c: colIndex } } }));
    }
  };

  const getCellClass = (r, c) => {
    const classes = [];
    
    // Exact matches (Start/End)
    if (selections.ref.start?.r === r && selections.ref.start?.c === c) classes.push('cell-selected ref');
    if (selections.ref.end?.r === r && selections.ref.end?.c === c) classes.push('cell-selected ref');
    if (selections.name.start?.r === r && selections.name.start?.c === c) classes.push('cell-selected name');
    if (selections.name.end?.r === r && selections.name.end?.c === c) classes.push('cell-selected name');
    if (selections.price.start?.r === r && selections.price.start?.c === c) classes.push('cell-selected price');
    if (selections.price.end?.r === r && selections.price.end?.c === c) classes.push('cell-selected price');

    // Range highlights
    const checkRange = (slot, className) => {
      if (!slot.start) return;
      if (c === slot.start.c && r >= slot.start.r) {
        if (!slot.end || r <= slot.end.r) {
          classes.push(className);
        }
      }
    };

    checkRange(selections.ref, 'range-ref');
    checkRange(selections.name, 'range-name');
    checkRange(selections.price, 'range-price');

    return classes.join(' ');
  };

  const canFinalize = selections.ref.start && selections.name.start && selections.price.start;

  const handleFinalize = () => {
    if (!canFinalize) return;

    const allEndRows = [
      selections.ref.end?.r,
      selections.name.end?.r,
      selections.price.end?.r
    ].filter(r => r !== undefined && r !== null);

    const mapping = {
      ref: selections.ref.start.c,
      desc: selections.name.start.c,
      price: selections.price.start.c,
      startRow: Math.min(selections.ref.start.r, selections.name.start.r, selections.price.start.r),
      endRow: allEndRows.length > 0 ? Math.max(...allEndRows) + 1 : null
    };

    onConfirm(mapping, filteredData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in">
        <div className="wizard-header">
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
            {['ref', 'name', 'price'].map(slot => (
              <button 
                key={slot}
                className={`pill ${activeSlot === slot ? 'active' : ''}`}
                onClick={() => setActiveSlot(slot)}
              >
                {slot.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>FOLHA</label>
              <select className="pill" value={selectedSheet} onChange={(e) => { setSelectedSheet(e.target.value); setSelections({ ref: { start: null, end: null }, name: { start: null, end: null }, price: { start: null, end: null } }); setIgnoredRows(new Set()); }}>
                {sheetNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <button onClick={() => setShowRaw(!showRaw)} className="pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {showRaw ? <EyeOff size={14}/> : <Eye size={14}/>} {showRaw ? 'Ver Tabela' : 'Ver Dados Brutos'}
            </button>
          </div>

          {!showRaw && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seleciona o slot acima e clica nas células para mapear.</p>
            </div>
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
