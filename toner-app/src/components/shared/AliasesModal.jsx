import { X, Trash2, ArrowRight } from 'lucide-react';

const AliasesModal = ({ aliases, onRemove, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="header-text">
            <h2>Gerir Uniões Manuais</h2>
            <p className="subtitle">Tens {aliases.length} uniões ativas que serão aplicadas a todas as tabelas.</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '1.5rem 0' }}>
          <div className="aliases-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {aliases.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>Ainda não criaste nenhuma união manual.</p>
            ) : (
              aliases.map(alias => (
                <div 
                  key={alias.sourceId} 
                  className="alias-card"
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    border: '1px solid #eee',
                    background: '#f8fafc',
                    marginBottom: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#e2e8f0', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ORIGEM</span>
                      <span style={{ fontWeight: 500, color: '#334155' }}>{alias.sourceId}</span>
                    </div>
                    <div style={{ margin: '0.4rem 0', display: 'flex', justifyContent: 'center' }}>
                      <ArrowRight size={14} color="#94a3b8" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', background: '#f0f9ff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>DESTINO</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{alias.targetName}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onRemove(alias.sourceId)} 
                    className="btn-icon" 
                    style={{ color: '#ef4444', background: '#fee2e2', borderRadius: '8px', padding: '0.6rem' }}
                    title="Remover União"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '1.2rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-primary">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default AliasesModal;
