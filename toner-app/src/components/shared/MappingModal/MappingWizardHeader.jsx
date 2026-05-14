import { Save, Trash2 } from 'lucide-react';

const MappingWizardHeader = ({ 
  fileName,
  activeSlot, 
  setActiveSlot, 
  selectedSheet, 
  sheetNames, 
  onSheetChange, 
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

  const getSlotHint = () => {
    const baseHints = {
      ref: "Clique na primeira célula com um código de produto. Se clicar numa segunda célula na mesma coluna, o sistema apenas importará os dados entre esses dois pontos.",
      name: "Clique na primeira célula com a descrição ou nome do produto. Pode limitar o fim da lista clicando numa segunda célula abaixo.",
      price: "Clique na primeira célula com o valor de venda. Tal como nas outras, pode clicar numa segunda célula para definir o limite inferior."
    };
    return baseHints[activeSlot];
  };

  return (
    <div className="wizard-header">
      {/* 1. Título e Folha */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Configurar Mapeamento</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ficheiro: <strong style={{ color: 'var(--primary)' }}>{fileName}</strong></p>
        </div>
        
        <div className="profile-input-group" style={{ minWidth: '150px' }}>
          <label className="label-tiny">FOLHA DO EXCEL</label>
          <select className="pill" value={selectedSheet} onChange={(e) => onSheetChange(e.target.value)}>
            {sheetNames.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* 2. Perfis */}
      <div className="profile-controls" style={{ marginBottom: '1.5rem' }}>
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

      {/* 3. Caixa de Instruções (Novo Layout) */}
      <div className="instruction-box" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
        <p style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500, marginBottom: '1rem' }}>
          Para importar os produtos, precisamos de saber onde estão os dados no Excel. Selecione cada opção abaixo e clique na tabela para mapear:
        </p>

        <div className="step-indicator-row" style={{ justifyContent: 'flex-start', gap: '0.8rem', marginBottom: '1rem' }}>
          {[
            { id: 'ref', label: '1. REFERÊNCIA' },
            { id: 'name', label: '2. NOME' },
            { id: 'price', label: '3. PREÇO' }
          ].map(slot => (
            <button 
              key={slot.id}
              className={`pill slot-${slot.id} ${activeSlot === slot.id ? 'active' : ''}`}
              onClick={() => setActiveSlot(slot.id)}
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}
            >
              {slot.label}
            </button>
          ))}
        </div>

        <div className="dynamic-hint" style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, display: 'flex', gap: '0.5rem' }}>
          <div style={{ minWidth: '4px', background: 'var(--primary)', borderRadius: '2px' }}></div>
          <p>{getSlotHint()}</p>
        </div>
      </div>
    </div>
  );
};

export default MappingWizardHeader;

