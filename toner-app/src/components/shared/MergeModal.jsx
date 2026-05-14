import { useState, useMemo } from 'react';
import { Search, X, Check, ArrowRight } from 'lucide-react';

const MergeModal = ({ sourceProduct, allProducts, onConfirm, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState(1); // 1: Select Target, 2: Select Name
  const [targetProduct, setTargetProduct] = useState(null);
  const [selectedName, setSelectedName] = useState(sourceProduct.desc);

  const filteredProducts = useMemo(() => {
    if (searchTerm.length < 2) return [];
    const s = searchTerm.toLowerCase();
    
    // Get file IDs present in the source product
    const sourceFileIds = Object.keys(sourceProduct.prices);

    return allProducts.filter(p => {
      if (p.id === sourceProduct.id) return false;
      
      // RESTRICTION: Only allow merging if there are NO common files
      const targetFileIds = Object.keys(p.prices);
      const hasOverlap = targetFileIds.some(fileId => sourceFileIds.includes(fileId));
      if (hasOverlap) return false;

      const matchesDesc = p.desc.toLowerCase().includes(s);
      const matchesRef = Object.values(p.refs).some(r => r?.toLowerCase().includes(s));
      
      return matchesDesc || matchesRef;
    }).slice(0, 10);
  }, [allProducts, searchTerm, sourceProduct.id, sourceProduct.prices]);

  const handleSelectTarget = (product) => {
    setTargetProduct(product);
    setSelectedName(product.desc); // Default to target name
    setStep(2);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in" style={{ maxWidth: '500px' }}>
        <button onClick={onClose} className="btn-close-modal" title="Fechar"><X size={20} /></button>

        <div className="modal-header">
          <div className="header-text">
            <h2>Unir Toners/Tinteiros Manualmente</h2>            <p className="subtitle">Estás a unir: <strong>{sourceProduct.desc}</strong></p>
          </div>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <div className="step-container">
              <label className="label-tiny">Pesquisar toner/tinteiro de destino</label>              <div className="search-container" style={{ margin: '0.5rem 0 1rem 0' }}>
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="premium-search" 
                  placeholder="Nome ou referência do destino..." 
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="results-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {filteredProducts.map(p => (
                  <div 
                    key={p.id} 
                    className="result-item" 
                    onClick={() => handleSelectTarget(p)}
                    style={{ 
                      padding: '0.8rem', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      border: '1px solid #eee',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.desc}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>ID: {p.id}</div>
                    </div>
                    <ArrowRight size={16} color="var(--primary)" />
                  </div>
                ))}
                {searchTerm.length >= 2 && filteredProducts.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>Nenhum toner/tinteiro encontrado.</p>                )}
                {searchTerm.length < 2 && (
                  <p style={{ textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>Digita pelo menos 2 caracteres para pesquisar.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="step-container">
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{sourceProduct.desc}</span>
                  <ArrowRight size={16} />
                  <span style={{ fontWeight: 700 }}>{targetProduct.desc}</span>
                </div>
              </div>

              <label className="label-tiny">Qual o nome a manter para este grupo?</label>
              <div className="name-options" style={{ marginTop: '0.5rem' }}>
                <div 
                  className={`option-card ${selectedName === targetProduct.desc ? 'active' : ''}`}
                  onClick={() => setSelectedName(targetProduct.desc)}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    border: `2px solid ${selectedName === targetProduct.desc ? 'var(--primary)' : '#eee'}`,
                    cursor: 'pointer',
                    marginBottom: '0.8rem',
                    background: selectedName === targetProduct.desc ? '#f0f9ff' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div className={`radio-circle ${selectedName === targetProduct.desc ? 'checked' : ''}`} style={{ 
                    width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #ccc',
                    background: selectedName === targetProduct.desc ? 'var(--primary)' : 'white'
                  }}></div>
                  <span style={{ fontSize: '0.9rem' }}>{targetProduct.desc}</span>
                </div>

                <div 
                  className={`option-card ${selectedName === sourceProduct.desc ? 'active' : ''}`}
                  onClick={() => setSelectedName(sourceProduct.desc)}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    border: `2px solid ${selectedName === sourceProduct.desc ? 'var(--primary)' : '#eee'}`,
                    cursor: 'pointer',
                    background: selectedName === sourceProduct.desc ? '#f0f9ff' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div className={`radio-circle ${selectedName === sourceProduct.desc ? 'checked' : ''}`} style={{ 
                    width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #ccc',
                    background: selectedName === sourceProduct.desc ? 'var(--primary)' : 'white'
                  }}></div>
                  <span style={{ fontSize: '0.9rem' }}>{sourceProduct.desc}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={() => step === 2 ? setStep(1) : onClose()} className="btn-secondary">
            {step === 2 ? 'Voltar' : 'Cancelar'}
          </button>
          {step === 2 && (
            <button 
              onClick={() => onConfirm(targetProduct.id, selectedName)} 
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Check size={18} />
              Confirmar União
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MergeModal;
