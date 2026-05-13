import { useState, useEffect } from 'react';
import { Search, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import MappingModal from './components/shared/MappingModal';
import ComparisonTable from './components/Table/ComparisonTable';
import { CartManager } from './components/shared/CartManager';
import { useToner } from './context/TonerContext';
import { useProductComparison } from './hooks/useProductComparison';
import { useExcelHandler } from './hooks/useExcelHandler';
import { useAppActions } from './hooks/useAppActions';
import PriceHistoryModal from './components/shared/PriceHistoryModal';

const SEARCH_DEBOUNCE_MS = 300;
const ROWS_PER_PAGE = 25;

const App = () => {
  const { 
    activeFiles, 
    setActiveFiles, 
    cart, 
    favorites, 
    toggleFavorite, 
    addToCart, 
    updateCart, 
    priceHistory 
  } = useToner();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHistory, setShowHistory] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const { 
    showMapper, 
    setShowMapper, 
    handleFiles,
    handleFileDrop, 
    handleMappingConfirm 
  } = useExcelHandler(setActiveFiles, favorites);

  const { 
    toast, 
    handleAddToCart, 
    handleResetTotal 
  } = useAppActions(addToCart);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const comparisonData = useProductComparison(activeFiles, debouncedSearch, favorites, priceHistory);
  
  // Pagination logic
  const totalPages = Math.ceil(comparisonData.length / ROWS_PER_PAGE);
  const paginatedData = comparisonData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  // Global Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only turn off if we are leaving the window
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className="app-shell"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="drag-overlay animate-in">
          <div className="drag-content">
            <div className="icon-circle large">
              <Upload size={48} />
            </div>
            <h2>Largar para Importar</h2>
            <p>Os ficheiros Excel serão processados instantaneamente</p>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="header-content">
          <div className="header-actions" style={{ marginLeft: 'auto' }}>
            {toast && <div className="toast animate-in">{toast}</div>}
            
            {Object.keys(cart).length > 0 && (
              <button onClick={() => setIsCartOpen(true)} className="btn-cart">
                <span className="cart-count">{Object.keys(cart).length}</span>
                Carrinho
              </button>
            )}
            
            <button onClick={handleResetTotal} className="btn-reset">
              Reset Total
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero-section">
          <div className="hero-card animate-in">
            <div className="upload-zone">
              <input type="file" id="main-upload" hidden onChange={handleFileDrop} accept=".xlsx, .xls" />
              <label htmlFor="main-upload" className="upload-trigger">
                <div className="icon-circle">
                  <Upload size={24} />
                </div>
                <div className="upload-text">
                  <h3>Adicionar Ficheiros</h3>
                  <p>Arrasta ou clica para importar tabelas Excel</p>
                </div>
              </label>
            </div>
          </div>
        </section>

        {activeFiles && activeFiles.length > 0 && (
          <section className="files-inventory animate-in">
            <div className="inventory-grid">
              {activeFiles.map(f => (
                <div key={f.id} className="file-chip">
                  <span 
                    className="file-name"
                    onClick={() => {
                      const bundle = { 
                        sheetNames: [f.name], 
                        sheetsData: { [f.name]: f.data.map((d) => [d.ref, d.desc, d.price]) } 
                      };
                      setShowMapper({ fileName: f.name, excelBundle: bundle }); 
                    }}
                  >
                    {f.name}
                  </span>
                  <button 
                    className="file-remove"
                    onClick={() => setActiveFiles(prev => prev.filter(file => file.id !== f.id))}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => setActiveFiles([])} className="btn-clear-all">
                Limpar Tudo
              </button>
            </div>
          </section>
        )}

        <section className="dashboard-metrics animate-in">
          {activeFiles && activeFiles.length > 0 && (
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Produtos Comparados</span>
                <span className="metric-value">{comparisonData.length}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Fornecedores Ativos</span>
                <span className="metric-value">{activeFiles.length}</span>
              </div>
              <div className="metric-item highlight">
                <span className="metric-label">Poupança Potencial</span>
                <span className="metric-value">
                  {comparisonData.reduce((acc, item) => acc + (item.delta || 0), 0).toFixed(2)}€
                </span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Favoritos</span>
                <span className="metric-value">{favorites.length}</span>
              </div>
            </div>
          )}
        </section>

        <section className="search-section animate-in">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              className="premium-search" 
              placeholder="Pesquisar por modelo ou referência..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </section>

        <section className="results-section animate-in">
          <div className="results-container">
            {activeFiles && comparisonData.length > 0 ? (
              <>
                <ComparisonTable 
                  comparisonData={paginatedData} 
                  activeFiles={activeFiles} 
                  onAddToCart={handleAddToCart}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onShowHistory={setShowHistory}
                />
                
                {comparisonData.length > 0 && (
                  <div className="pagination-bar">
                    {totalPages > 1 && (
                      <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="btn-page"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}
                    
                    <div className="page-info">
                      {totalPages > 1 ? (
                        <>Página <strong>{currentPage}</strong> de {totalPages}</>
                      ) : (
                        <span>Todos os produtos</span>
                      )}
                      <span className="total-results">({comparisonData.length} resultados)</span>
                    </div>
                    
                    {totalPages > 1 && (
                      <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="btn-page"
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-illustration">
                  <Search size={48} />
                </div>
                {activeFiles === null ? (
                  <p>A carregar dados...</p>
                ) : activeFiles.length === 0 ? (
                  <p>Carregue pelo menos um ficheiro para começar.</p>
                ) : debouncedSearch ? (
                  <p>Nenhum produto encontrado para "<strong>{debouncedSearch}</strong>".</p>
                ) : (
                  <p>Ficheiros carregados, mas sem produtos em comum.<br/>Tenta pesquisar um modelo específico.</p>
                )}
              </div>
            )}
          </div>
        </section>

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
          key={showMapper.fileName}
          fileName={showMapper.fileName}
          excelBundle={showMapper.excelBundle}
          onConfirm={handleMappingConfirm}
          onCancel={() => setShowMapper(null)}
        />
      )}

      {showHistory && (
        <PriceHistoryModal 
          productId={showHistory.id} 
          productName={showHistory.desc} 
          onClose={() => setShowHistory(null)} 
        />
      )}
    </div>
  );
};

export default App;
