import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ResetModal = ({ onConfirm, onClose }) => {
  const [options, setOptions] = useState({
    files: false,
    cart: false,
    favorites: false,
    aliases: false,
    profiles: false
  });

  const toggleOption = (key) => {
    setOptions(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'files' && next.files) {
        next.cart = true;
      }
      return next;
    });
  };

  const isFilesSelected = options.files;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-in" style={{ maxWidth: '400px' }}>
        <button onClick={onClose} className="btn-close-modal"><X size={20} /></button>
        
        <div className="modal-header">
          <div className="header-text">
            <h2>Limpeza Personalizada</h2>
            <p className="subtitle">Seleciona o que desejas remover</p>
          </div>
        </div>

        <div className="modal-body">
          <div className="reset-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.files} onChange={() => toggleOption('files')} />
              <span>Ficheiros Importados (Limpa Carrinho)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', opacity: isFilesSelected ? 0.6 : 1 }}>
              <input 
                type="checkbox" 
                checked={options.cart} 
                onChange={() => toggleOption('cart')} 
                disabled={isFilesSelected}
              />
              <span>Carrinho de Compras</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.favorites} onChange={() => toggleOption('favorites')} />
              <span>Favoritos</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.aliases} onChange={() => toggleOption('aliases')} />
              <span>Uniões de Produtos (Aliases)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={options.profiles} onChange={() => toggleOption('profiles')} />
              <span>Perfis de Mapeamento</span>
            </label>
          </div>

          {(options.files || options.aliases || options.profiles) && (
            <div style={{ marginTop: '1.5rem', color: '#b91c1c', background: '#fef2f2', padding: '0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', gap: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span>Aviso: Algumas seleções são irreversíveis.</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button 
            disabled={!Object.values(options).some(v => v)} 
            onClick={() => onConfirm(options)} 
            className="btn-primary"
          >
            Limpar Selecionados
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetModal;
