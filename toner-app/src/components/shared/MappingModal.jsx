import { useState } from 'react';
import { Check } from 'lucide-react';
import useMappingState from '../../hooks/useMappingState';
import MappingWizardHeader from './MappingModal/MappingWizardHeader';
import MappingPreviewTable from './MappingModal/MappingPreviewTable';

const MappingModal = ({ excelBundle, onConfirm, onCancel }) => {
  const { sheetNames, sheetsData, fileName } = excelBundle;
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
    handleSheetChange,
    companyName,
    setCompanyName,
    profiles,
    handleDeleteProfile,
    handleSaveProfile
  } = useMappingState(sheetNames, sheetsData, fileName);

  const [showRaw, setShowRaw] = useState(false);

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
        <MappingWizardHeader 
          activeSlot={activeSlot}
          setActiveSlot={setActiveSlot}
          selectedSheet={selectedSheet}
          sheetNames={sheetNames}
          onSheetChange={handleSheetChange}
          showRaw={showRaw}
          setShowRaw={setShowRaw}
          companyName={companyName}
          setCompanyName={setCompanyName}
          onSaveProfile={handleSaveProfile}
          onDeleteProfile={handleDeleteProfile}
          profiles={profiles}
        />

        <MappingPreviewTable 
          showRaw={showRaw}
          currentData={currentData}
          previewRows={previewRows}
          colIndices={colIndices}
          ignoredRows={ignoredRows}
          toggleIgnoreRow={toggleIgnoreRow}
          handleCellClick={handleCellClick}
          getCellClass={getCellClass}
        />

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
