import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Upload, FileText, X, TrendingDown, CheckCircle2, ChevronDown, ChevronRight, Info, Trash2 } from 'lucide-react';
import { readRawExcel, parseWithMapping } from './utils/excelParser';
import MappingModal from './components/MappingModal';

// --- Pure UI Components ---

const FileStatus = ({ name, count, onRemove }) => (
  <div className="status-badge animate-in" role="status">
    <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {name} <small style={{ opacity: 0.5 }}>· {count}</small>
    </span>
    <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
      <X size={14} color="#a1a1aa" />
    </button>
  </div>
);

const PriceDisplay = ({ price, isBest }) => (
  <td className={isBest ? 'price-best' : 'price-normal'}>
    {price ? (
      <div className="price-wrapper">
        <span className="price-value">{price.toFixed(2)}€</span>
      </div>
    ) : (
      <span className="price-none" style={{ color: '#e4e4e7' }}>---</span>
    )}
  </td>
);

// --- Main Engine ---

const App = () => {
  const [activeFiles, setActiveFiles] = useState([]); // [{ id, name, data, mapping }]
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [showMapper, setShowMapper] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

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
      ...prev.filter(f => f.name !== showMapper.fileName), 
      { id: Date.now(), name: showMapper.fileName, data: parsed, mapping }
    ]);
    setShowMapper(null);
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const comparisonData = useMemo(() => {
    if (activeFiles.length === 0 || !debouncedSearch) return [];

    const s = debouncedSearch.toLowerCase();
    const masterMap = new Map();

    activeFiles.forEach(file => {
      file.data.forEach(item => {
        const matchesRef = item.ref.toLowerCase().includes(s);
        const matchesDesc = item.desc && item.desc.toLowerCase().includes(s);
        
        if (matchesRef || matchesDesc) {
          const key = item.desc.trim().toLowerCase() || item.ref.trim().toLowerCase();
          
          if (!masterMap.has(key)) {
            masterMap.set(key, { 
              id: key,
              desc: item.desc || 'Item sem descrição', 
              prices: {}, 
              refs: {},
              rowNumbers: {}
            });
          }
          
          const entry = masterMap.get(key);
          entry.prices[file.id] = item.price;
          entry.refs[file.id] = item.ref;
          entry.rowNumbers[file.id] = item.rowIdx;
        }
      });
    });

    return Array.from(masterMap.values());
  }, [activeFiles, debouncedSearch]);

  return (
    <div className="app-shell">
      <main className="container">
        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.5 }}
          >
            Reset Total (Limpar Memória)
          </button>
        </div>
        {/* Simplified Upload */}
        <section className="upload-shelf">
          <div className="drop-surface">
            <input type="file" id="main-upload" hidden onChange={handleFileDrop} accept=".xlsx, .xls" />
            <label htmlFor="main-upload" className="drop-content">
              <Upload size={18} strokeWidth={2} />
              <span>Adicionar Ficheiro para Comparar</span>
            </label>
          </div>
        </section>

        {/* Active Files */}
        {activeFiles.length > 0 && (
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
          {comparisonData.length > 0 ? (
            <table className="pro-table">
              <thead>
                <tr>
                  <th width="60"></th>
                  <th>Descrição do Produto</th>
                  {activeFiles.map(f => <th key={f.id} className="col-price">{f.name}</th>)}
                  <th width="150" style={{ textAlign: 'center' }}>Melhor Preço</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item) => {
                  const prices = Object.values(item.prices);
                  const minPrice = Math.min(...prices);
                  const bestFileId = Object.keys(item.prices).find(id => item.prices[id] === minPrice);
                  const bestFile = activeFiles.find(f => f.id.toString() === bestFileId.toString());
                  const isExpanded = expandedRows.has(item.id);

                  return (
                    <React.Fragment key={item.id}>
                      <tr key={item.id} className="table-row">
                        <td style={{ width: '40px', textAlign: 'center' }}>
                          <button 
                            onClick={() => {
                              setActiveFiles(prev => prev.map(f => ({
                                ...f,
                                data: f.data.filter(d => (d.desc.trim().toLowerCase() || d.ref.trim().toLowerCase()) !== item.id)
                              })));
                            }}
                            className="btn-icon-danger"
                            title="Eliminar este produto da vista"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                        <td onClick={() => toggleRow(item.id)}>
                          <div className="product-name">{item.desc}</div>
                          <div className="product-subtext">
                             Ficheiro: <strong>{activeFiles.find(f => item.prices[f.id])?.name}</strong> (Linha {item.rowNumbers[Object.keys(item.rowNumbers)[0]]})
                          </div>
                        </td>
                        {activeFiles.map(f => (
                          <PriceDisplay key={f.id} price={item.prices[f.id]} isBest={item.prices[f.id] === minPrice && prices.length > 1} />
                        ))}
                        <td style={{ textAlign: 'center' }}>
                          {bestFile && prices.length > 1 && (
                            <div className="best-offer-chip">
                              {minPrice.toFixed(2)}€
                            </div>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="row-details">
                          <td colSpan={activeFiles.length + 3}>
                            <div className="details-content animate-in">
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                                {Object.entries(item.refs).map(([fileId, ref]) => {
                                  const f = activeFiles.find(file => file.id.toString() === fileId.toString());
                                  return (
                                    <div key={fileId}>
                                      <div className="ref-company" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{f?.name}</div>
                                      <div className="ref-code">{ref}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state-pro" style={{ textAlign: 'center', padding: '10rem 2rem', opacity: 0.3 }}>
              <p style={{ fontSize: '1rem' }}>Pesquise um modelo para comparar os ficheiros carregados.</p>
            </div>
          )}
        </div>
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
