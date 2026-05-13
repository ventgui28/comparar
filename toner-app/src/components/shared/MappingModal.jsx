import React, { useState, useMemo } from 'react';
import { Search, Eye, EyeOff, Trash2, Check } from 'lucide-react';
import useMappingState from '../../hooks/useMappingState';

const MappingModal = ({ excelBundle, onConfirm, onCancel, fileName }) => {
  const { sheetNames, sheetsData } = excelBundle;
  const {
    selectedSheet,
    activeSlot,
    setActiveSlot,
    selections,
    ignoredRows,
    currentData,
    filteredData,
    toggleIgnoreRow,
    handleCellClick,
    handleSheetChange
  } = useMappingState(sheetNames, sheetsData);

  const [showRaw, setShowRaw] = useState(false);
  const [debugSearch, setDebugSearch] = useState('');

  const previewRows = currentData.slice(0, 200); 
  const maxCols = Math.max(...previewRows.map(row => (row ? row.length : 0)), 0);
  const colIndices = Array.from({ length: maxCols }, (_, i) => i);

  const getCellClass = (r, c) => {
    const slot = ['ref', 'name', 'price'].find(s => 
      (selections[s].start?.r === r && selections[s].start?.c === c) ||
      (selections[s].end?.r === r && selections[s].end?.c === c)
    );

    if (slot) {
      return `cell-selected ${slot}`;
    }

    const checkRange = (s, className) => {
      if (selections[s].start && c === selections[s].start.c && r >= selections[s].start.r) {
        if (!selections[s].end || r <= selections[s].end.r) return className;
      }
      return null;
    };

    const rangeClass = checkRange('ref', 'range-ref') || 
                       checkRange('name', 'range-name') || 
                       checkRange('price', 'range-price');

    return rangeClass || '';
  };

  const canFinalize = selections.ref.start && selections.name.start && selections.price.start;

  const handleFinalize = () => {
    if (!canFinalize) return;

    const allStarts = [selections.ref.start?.r, selections.name.start?.r, selections.price.start?.r];
    const allEnds = [selections.ref.end?.r, selections.name.end?.r, selections.price.end?.r];

    const mapping = {
      ref: selections.ref.start.c,
      desc: selections.name.start.c,
      price: selections.price.start.c,
      startRow: Math.min(...allStarts.filter(r => r != null)),
      endRow: allEnds.some(e => e != null) ? Math.max(...allEnds.filter(e => e != null)) : null
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
              <select className="pill" value={selectedSheet} onChange={(e) => handleSheetChange(e.target.value)}>
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
