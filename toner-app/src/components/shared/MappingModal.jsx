import { useState, useMemo } from 'react';
import useMappingState from '../../hooks/useMappingState';
import MappingWizardHeader from './MappingModal/MappingWizardHeader';
import MappingPreviewTable from './MappingModal/MappingPreviewTable';

const MappingModal = ({ excelBundle, onConfirm, onCancel, fileName }) => {
  const { sheetNames, sheetsData } = excelBundle;
  const {
    selectedSheet,
    activeSlot,
    setActiveSlot,
    selections,
    ignoredRows,
    currentData,
    toggleIgnoreRow,
    handleCellClick,
    handleSheetChange,
    companyName,
    setCompanyName,
    profiles,
    handleDeleteProfile,
    handleSaveProfile,
    handleProfileSelect,
    setSelections
  } = useMappingState(sheetNames, sheetsData, fileName);

  const [showRaw, setShowRaw] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const previewData = useMemo(() => {
    return isExpanded ? currentData : currentData.slice(0, 200);
  }, [currentData, isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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

  const handleFinalize = async () => {
    const allStarts = [selections.ref.start?.r, selections.name.start?.r, selections.price.start?.r];
    const allEnds = [selections.ref.end?.r, selections.name.end?.r, selections.price.end?.r];

    const mapping = {
      ref: selections.ref.start.c,
      desc: selections.name.start.c,
      price: selections.price.start.c,
      startRow: Math.min(...allStarts.filter(r => r != null)),
      endRow: allEnds.some(e => e != null) ? Math.max(...allEnds.filter(e => e != null)) : null
    };

    // Auto-save profile if company name is set
    if (companyName && companyName.trim()) {
      await handleSaveProfile();
    }

    onConfirm(mapping, currentData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in">
        <MappingWizardHeader 
          fileName={fileName}
          sheetNames={sheetNames}
          activeSheet={selectedSheet}
          setActiveSheet={handleSheetChange}
          activeSlot={activeSlot}
          setActiveSlot={setActiveSlot}
          selections={selections}
          onReset={() => setSelections({ ref: { start: null, end: null }, name: { start: null, end: null }, price: { start: null, end: null } })}
          showRaw={showRaw}
          setShowRaw={setShowRaw}
          companyName={companyName}
          setCompanyName={setCompanyName}
          onSaveProfile={handleSaveProfile}
          onDeleteProfile={handleDeleteProfile}
          onProfileSelect={handleProfileSelect}
          profiles={profiles}
        />

        <div className="preview-container">
          <MappingPreviewTable 
            data={previewData}
            showRaw={showRaw}
            currentData={currentData}
            getCellClass={getCellClass}
            handleCellClick={handleCellClick}
            ignoredRows={ignoredRows}
            onToggleRow={toggleIgnoreRow}
          />
        </div>

        <div className="preview-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.8rem' }}>
          <span className="label-tiny" style={{ color: '#666' }}>
            {isExpanded ? `A mostrar todas as ${currentData.length} linhas` : `A mostrar 200 de ${currentData.length} linhas`}
          </span>
          
          {currentData.length > 200 && (
            <button 
              onClick={toggleExpand}
              className="btn-text-action"
              style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', background: 'none', border: 'none', textTransform: 'uppercase' }}
            >
              {isExpanded ? 'mostrar menos' : 'mostrar mais'}
            </button>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
          <button 
            onClick={handleFinalize} 
            className="btn-primary"
            disabled={!selections.ref.start || !selections.name.start || !selections.price.start}
          >
            Confirmar Mapeamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default MappingModal;
