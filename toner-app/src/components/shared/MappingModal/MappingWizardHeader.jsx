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

  // Ensure select value defaults to empty if companyName is manual or doesn't match
  const selectValue = profiles.some(p => p.name === companyName) ? companyName : "";

  return (
    <div className="wizard-header">
      <div className="profile-controls">
        <div className="profile-input-group">
          <input 
            type="text" 
            placeholder="Nome da Empresa (opcional para salvar perfil)" 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value)}
            className="pill"
            style={{ minWidth: '250px' }}
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
          <select className="pill" value={selectedSheet} onChange={(e) => onSheetChange(e.target.value)}>
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
  );
};

export default MappingWizardHeader;
