import { Eye, EyeOff, Save, Trash2 } from 'lucide-react';

const MappingWizardHeader = ({ 
  activeSlot, 
  setActiveSlot, 
  selectedSheet, 
  sheetNames, 
  onSheetChange, 
  showRaw, 
  setShowRaw,
  companyName,
  setCompanyName,
  onSaveProfile,
  onDeleteProfile,
  onProfileSelect,
  profiles
}) => {
  const handleProfileSelect = (e) => {
    const selectedName = e.target.value;
    if (selectedName) {
      onProfileSelect(selectedName);
    }
  };

  const selectValue = profiles.some(p => p.name === companyName) ? companyName : "";

  return (
    <div className="wizard-header">
      <div className="profile-controls">
        <div className="profile-input-group">
          <input 
            type="text" 
            placeholder="Nome da Empresa..." 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value)}
            className="pill company-input"
          />
        </div>

        {profiles.length > 0 && (
          <div className="profile-select-group">
            <select 
              className="pill" 
              onChange={handleProfileSelect}
              value={selectValue}
            >
              <option value="">Selecionar Perfil...</option>
              {profiles.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
            {companyName && profiles.some(p => p.name === companyName) && (
              <button 
                onClick={() => onDeleteProfile(companyName)} 
                className="pill danger" 
                title="Apagar Perfil"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="step-indicator-row">
        {[
          { id: 'ref', label: 'REFERÊNCIA' },
          { id: 'name', label: 'NOME' },
          { id: 'price', label: 'PREÇO' }
        ].map(slot => (
          <button 
            key={slot.id}
            className={`pill slot-${slot.id} ${activeSlot === slot.id ? 'active' : ''}`}
            onClick={() => setActiveSlot(slot.id)}
          >
            {slot.label}
          </button>
        ))}
      </div>

      <div className="profile-controls">
        <div className="profile-input-group">
          <label className="label-tiny">FOLHA</label>
          <select className="pill" value={selectedSheet} onChange={(e) => onSheetChange(e.target.value)}>
            {sheetNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        
        <button onClick={() => setShowRaw(!showRaw)} className="pill">
          {showRaw ? <EyeOff size={14}/> : <Eye size={14}/>} 
          <span>{showRaw ? 'Ver Tabela' : 'Ver Dados Brutos'}</span>
        </button>
      </div>

      {!showRaw && (
        <div className="instruction-text">
          <p>Selecione o slot acima e clique nas células para mapear as colunas correspondentes.</p>
        </div>
      )}
    </div>
  );
};

export default MappingWizardHeader;
