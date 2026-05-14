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
      ref: "Clique na primeira célula com um código de toner/tinteiro. Se clicar numa segunda célula na mesma coluna, o sistema apenas importará os dados entre esses dois pontos.",
      name: "Clique na primeira célula com a descrição ou nome do toner/tinteiro. Pode limitar o fim da lista clicando numa segunda célula abaixo.",
      price: "Clique na primeira célula com o valor de venda. Tal como nas outras, pode clicar numa segunda célula para definir o limite inferior."
    };
    return baseHints[activeSlot];
  };

  return (
    <div className="wizard-header">
      {/* 1. Título e Folha */}
      <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Configurar Mapeamento</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>Ficheiro: <strong style={{ color: 'var(--primary)' }}>{fileName}</strong></p>
        </div>
        
        <div className="profile-input-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
          <label className="label-tiny" style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.7 }}>FOLHA DO EXCEL</label>
          <select className="pill" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} value={selectedSheet} onChange={(e) => onSheetChange(e.target.value)}>
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

      {/* 3. Caixa de Instruções (Novo Layout) */}
      <div className="instruction-box" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500, marginBottom: '1rem' }}>
          Para importar os toners/tinteiros, selecione cada opção e clique na coluna correspondente:
        </p>

        <div className="step-indicator-row" style={{ justifyContent: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
          {[
            { id: 'ref', label: '1. REFERÊNCIA' },
            { id: 'name', label: '2. NOME' },
            { id: 'price', label: '3. PREÇO' }
          ].map(slot => (
            <button 
              key={slot.id}
              className={`pill slot-${slot.id} ${activeSlot === slot.id ? 'active' : ''}`}
              onClick={() => setActiveSlot(slot.id)}
              style={{ padding: '0.5rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.025em' }}
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
  );
};

export default MappingWizardHeader;

