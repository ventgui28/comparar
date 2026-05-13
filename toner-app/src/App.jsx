import React, { useState, useEffect } from 'react';
import { Search, Upload, X } from 'lucide-react';
import { readRawExcel, parseWithMapping } from './utils/excelParser';
import { saveFiles, loadFiles } from './utils/db';
import MappingModal from './components/MappingModal';
import ComparisonTable from './components/ComparisonTable';
import { CartManager } from './components/CartManager';
import { useProductComparison } from './hooks/useProductComparison';

const App = () => {
  const [activeFiles, setActiveFiles] = useState(null); 
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('toner-cart');
    return saved ? JSON.parse(saved) : {};
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('toner-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMapper, setShowMapper] = useState(null);

  useEffect(() => {
    console.log('Attempting to load files from DB...');
    loadFiles().then(data => {
      console.log('Loaded from DB:', data);
      setActiveFiles(data || []);
    }).catch(err => console.error('DB Load Error:', err));
  }, []);

  useEffect(() => {
    localStorage.setItem('toner-cart', JSON.stringify(cart));
    localStorage.setItem('toner-favorites', JSON.stringify(favorites));
    if (activeFiles !== null) {
      console.log('Saving to DB:', activeFiles);
      saveFiles(activeFiles);
    }
  }, [cart, favorites, activeFiles]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const addToCart = (productId, qty) => {
    const item = comparisonData.find(i => i.id === productId);
    const shopId = Object.keys(item.prices).find(id => item.prices[id] === Math.min(...Object.values(item.prices).filter(p => p > 0)));
    setCart(prev => ({ ...prev, [productId]: { qty: parseInt(qty), shopId } }));
    setToast('Adicionado!');
    setTimeout(() => setToast(''), 2000);
  };

  const updateCart = (productId, qty) => {
    if (qty <= 0) {
      setCart(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    } else {
      setCart(prev => ({ ...prev, [productId]: { ...prev[productId], qty } }));
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const comparisonData = useProductComparison(activeFiles, debouncedSearch);

  const handleFileDrop = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const excelBundle = await readRawExcel(file);
      setShowMapper({ fileName: file.name, excelBundle });
    } catch (error) {
      alert('Erro no processamento.');
    } finally {
      event.target.value = '';
    }
  };

  const handleMappingConfirm = (mapping, rows) => {
    const parsed = parseWithMapping(rows, mapping, showMapper.fileName);
    setActiveFiles(prev => [
      ...(prev || []).filter(f => f.name !== showMapper.fileName), 
      { id: Date.now(), name: showMapper.fileName, data: parsed, mapping }
    ]);
    setShowMapper(null);
  };

  const handleDeleteProduct = (productId) => {
    setActiveFiles(prev => prev.map(f => ({
      ...f,
      data: f.data.filter(d => (d.desc.trim().toLowerCase() || d.ref.trim().toLowerCase()) !== productId)
    })));
  };

  return (
    <div className="app-shell">
      <main className="container">
        <div style={{ textAlign: 'right', marginBottom: '1rem', display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
          {toast && <span className="toast">{toast}</span>}
          {Object.keys(cart).length > 0 && (
            <button onClick={() => setIsCartOpen(true)} className="btn-secondary">Carrinho ({Object.keys(cart).length})</button>
          )}
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.5 }}
          >
            Reset Total
          </button>
        </div>

        <section className="upload-shelf">
          <div className="drop-surface">
            <input type="file" id="main-upload" hidden onChange={handleFileDrop} accept=".xlsx, .xls" />
            <label htmlFor="main-upload" className="drop-content">
              <Upload size={18} strokeWidth={2} />
              <span>Adicionar Ficheiro para Comparar</span>
            </label>
          </div>
        </section>

        {activeFiles && activeFiles.length > 0 && (
          <div className="indicators-row">
            {activeFiles.map(f => (
              <div key={f.id} className="file-badge">
                <span className="file-dot"></span>
                {f.name}
                <button 
                  onClick={() => setActiveFiles(prev => prev.filter(file => file.id !== f.id))}
                  style={{ background: 'none', border: 'none', marginLeft: '8px', cursor: 'pointer', color: 'var(--danger)' }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => setActiveFiles([])} 
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', marginLeft: 'auto' }}
            >
              Limpar Tudo
            </button>
          </div>
        )}

        <div className="search-wrap">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="main-search" 
            placeholder="Pesquisar por modelo ou referência..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="results-paper">
          {activeFiles && comparisonData.length > 0 ? (
            <ComparisonTable 
              comparisonData={comparisonData} 
              activeFiles={activeFiles} 
              onAddToCart={addToCart}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <div className="empty-state-pro" style={{ textAlign: 'center', padding: '10rem 2rem', opacity: 0.3 }}>
              {activeFiles === null ? (
                <p style={{ fontSize: '1rem' }}>A carregar dados...</p>
              ) : activeFiles.length === 0 ? (
                <p style={{ fontSize: '1rem' }}>Carregue pelo menos um ficheiro para começar.</p>
              ) : debouncedSearch ? (
                <p style={{ fontSize: '1rem' }}>Nenhum produto encontrado para "{debouncedSearch}".</p>
              ) : (
                <p style={{ fontSize: '1rem' }}>Ficheiros carregados, mas não encontrámos produtos em comum.<br/>Tenta pesquisar um modelo específico.</p>
              )}
            </div>
          )}
        </div>
        {isCartOpen && (
          <CartManager 
            cart={cart} 
            products={comparisonData} 
            activeFiles={activeFiles} 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} 
            onUpdateCart={updateCart}
          />
        )}
      </main>

      {showMapper && (
        <MappingModal 
          key={`${showMapper.fileName}-${Date.now()}`}
          fileName={showMapper.fileName}
          excelBundle={showMapper.excelBundle}
          onConfirm={handleMappingConfirm}
          onCancel={() => setShowMapper(null)}
        />
      )}
    </div>
  );
};

export default App;
