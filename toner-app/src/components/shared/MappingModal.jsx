import { useState, useMemo } from 'react';
import { Save, Trash2 } from 'lucide-react';
import useMappingState from '../../hooks/useMappingState';
import MappingPreviewTable from './MappingModal/MappingPreviewTable';
import ConfirmModal from './ConfirmModal';
import { finalizeMapping } from '../../utils/excelParser';

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

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  const previewData = useMemo(() => {
    return isExpanded ? currentData : currentData.slice(0, 200);
  }, [currentData, isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
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
    const hasCompanyName = companyName && companyName.trim();
    const matchesFileName = hasCompanyName && fileName.toLowerCase().includes(companyName.toLowerCase());

    if (!hasCompanyName || !matchesFileName) {
      setShowWarning(true);
      return;
    }

    await proceedWithFinalize();
  };

  const proceedWithFinalize = async () => {
    const mapping = finalizeMapping(selections);

    // Auto-save profile if company name is set
    if (companyName && companyName.trim()) {
      await handleSaveProfile();
    }

    onConfirm(mapping, currentData);
  };

  const warningContent = useMemo(() => {
    if (!companyName || !companyName.trim()) {
      return {
        title: "Atenção ao Nome do Fornecedor",
        message: "Não definiu um nome para este fornecedor. Sem o nome, o sistema não conseguirá guardar este mapeamento para utilização futura e será mais difícil identificar a origem destes preços na tabela de comparação.",
        confirmText: "Continuar sem nome",
        cancelText: "Voltar e definir"
      };
    }
    return {
      title: "Atenção ao Nome do Fornecedor",
      message: `O nome do fornecedor definido ('${companyName}') não parece coincidir com o nome do ficheiro. Isto pode dificultar a identificação automática do perfil no futuro.`,
      confirmText: "Continuar assim",
      cancelText: "Corrigir nome"
    };
  }, [companyName]);

  const getSlotHint = () => {
    const baseHints = {
      ref: "Clique na primeira célula com um código de toner/tinteiro. Se clicar numa segunda célula na mesma coluna, o sistema apenas importará os dados entre esses dois pontos.",
      name: "Clique na primeira célula com a descrição ou nome do toner/tinteiro. Pode limitar o fim da lista clicando numa segunda célula abaixo.",
      price: "Clique na primeira célula com o valor de venda. Tal como nas outras, pode clicar numa segunda célula para definir o limite inferior."
    };
    return baseHints[activeSlot];
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in" style={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Configurar Mapeamento</h2>
          <button 
            onClick={toggleSidebar}
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          >
            {isSidebarVisible ? '« Ocultar Painel' : '» Mostrar Painel'}
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isSidebarVisible ? 'var(--sidebar-width, 300px) 1fr' : '1fr', 
          gap: '1rem', 
          flex: 1, 
          overflow: 'hidden' 
        }}>
          {isSidebarVisible && (
            <aside className="mapping-sidebar">
              <div className="wizard-header">
                {/* 1. Folha */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <div className="profile-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label className="label-tiny" style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.7 }}>FOLHA DO EXCEL</label>
                    <select className="pill" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', width: '100%' }} value={selectedSheet} onChange={(e) => handleSheetChange(e.target.value)}>
                      {sheetNames.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                {/* 2. Perfis */}
                <div className="profile-controls" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', width: 'auto', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div className="profile-input-group">
                      <input 
                        type="text" 
                        placeholder="Nome do Fornecedor..." 
                        value={companyName} 
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="pill company-input"
                        style={{ width: '220px', fontSize: '0.85rem' }}
                      />
                    </div>

                    {profiles.length > 0 && (
                      <div className="profile-select-group" style={{ display: 'flex', gap: '0.4rem' }}>
                        <select 
                          className="pill" 
                          style={{ fontSize: '0.85rem' }}
                          onChange={(e) => handleProfileSelect(e.target.value)}
                          value={profiles.some(p => p.name === companyName) ? companyName : ""}
                        >
                          <option value="">Selecionar Perfil...</option>
                          {profiles.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                        {companyName && profiles.some(p => p.name === companyName) && (
                          <button 
                            onClick={() => handleDeleteProfile(companyName)} 
                            className="pill danger" 
                            title="Apagar Perfil"
                            style={{ padding: '0.4rem' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, textAlign: 'center', opacity: 0.8 }}>
                    💡 <strong>Dica:</strong> Use o nome da folha ou cabeçalho para deteção automática.
                  </p>
                </div>

                {/* 3. Caixa de Instruções */}
                <div className="instruction-box" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500, marginBottom: '1rem' }}>
                    Para importar os toners/tinteiros, selecione cada opção e clique na coluna correspondente:
                  </p>

                  <div className="step-indicator-row" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[
                      { id: 'ref', label: 'REF' },
                      { id: 'name', label: 'NOME' },
                      { id: 'price', label: 'PREÇO' }
                    ].map(slot => (
                      <button 
                        key={slot.id}
                        className={`pill slot-${slot.id} ${activeSlot === slot.id ? 'active' : ''}`}
                        onClick={() => setActiveSlot(slot.id)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.025em' }}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>

                  <div className="dynamic-hint" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, display: 'flex', gap: '0.6rem', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}>
                    <div style={{ minWidth: '3px', background: 'var(--primary)', borderRadius: '2px', alignSelf: 'stretch' }}></div>
                    <p style={{ margin: 0, textAlign: 'left' }}>{getSlotHint()}</p>
                  </div>
                </div>
              </div>
            </aside>
          )}

          <main className="preview-container" style={{ overflow: 'auto' }}>
            <MappingPreviewTable 
              data={previewData}
              currentData={currentData}
              getCellClass={getCellClass}
              handleCellClick={handleCellClick}
              ignoredRows={ignoredRows}
              onToggleRow={toggleIgnoreRow}
            />
          </main>
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

      {showWarning && (
        <ConfirmModal 
          title={warningContent.title}
          message={warningContent.message}
          confirmText={warningContent.confirmText}
          cancelText={warningContent.cancelText}
          onConfirm={proceedWithFinalize}
          onCancel={() => setShowWarning(false)}
          variant="warning"
        />
      )}
    </div>
  );
};

export default MappingModal;
