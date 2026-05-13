import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import PriceHistoryModal from '../shared/PriceHistoryModal';

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

const ComparisonTable = ({ comparisonData, activeFiles, onAddToCart, favorites, onToggleFavorite }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showHistory, setShowHistory] = useState(null);

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
    <table className="pro-table">
      <thead>
        <tr>
          <th width="40">Favorito</th>
          <th width="40">Histórico</th>
          <th width="120">Carrinho</th>
          <th>Descrição do Produto</th>
          <th width="150">Ref. Melhor Preço</th>
          {activeFiles.map(f => <th key={f.id} className="col-price">{f.name}</th>)}
          <th width="150" style={{ textAlign: 'center' }}>Poupança</th>
        </tr>
      </thead>
      <tbody>
        {comparisonData.map((item) => {
          const prices = Object.values(item.prices).filter(p => p > 0);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const savings = maxPrice - minPrice;
          const bestFileId = Object.keys(item.prices).find(id => item.prices[id] === minPrice);
          const bestRef = item.refs[bestFileId];
          const isExpanded = expandedRows.has(item.id);
          const isFavorite = favorites?.includes(item.id);

          return (
            <React.Fragment key={item.id}>
              <tr className="table-row">
                <td style={{ textAlign: 'center' }}>
                  <button onClick={() => onToggleFavorite(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                    {isFavorite ? '⭐' : '☆'}
                  </button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {isFavorite && (
                    <button onClick={() => setShowHistory(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                      📈
                    </button>
                  )}
                </td>
                <td style={{ width: '120px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      min="1" 
                      defaultValue="1" 
                      style={{ width: '40px' }}
                      id={`qty-${item.id}`}
                    />
                    <button 
                      onClick={() => onAddToCart(item.id, document.getElementById(`qty-${item.id}`).value)}
                      className="btn-add-cart"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td onClick={() => toggleRow(item.id)}>
                  <div className="product-name">{item.desc}</div>
                  <div className="product-subtext">
                     Ficheiro: <strong>{activeFiles.find(f => item.prices[f.id])?.name}</strong> (Linha {item.rowNumbers[Object.keys(item.rowNumbers)[0]]})
                  </div>
                </td>
                <td>
                    <div className="ref-code" style={{ fontWeight: 600, color: 'var(--success)' }}>{bestRef}</div>
                </td>
                {activeFiles.map(f => (
                  <PriceDisplay key={f.id} price={item.prices[f.id]} isBest={item.prices[f.id] === minPrice && prices.length > 1} />
                ))}
                <td style={{ textAlign: 'center' }}>
                  {prices.length > 1 && savings > 0 ? (
                    <div className="best-offer-chip">
                      -{savings.toFixed(2)}€
                    </div>
                  ) : (
                    <span style={{ color: '#e4e4e7' }}>---</span>
                  )}
                </td>
              </tr>
              {isExpanded && (
                <tr className="row-details">
                  <td colSpan={activeFiles.length + 6}>
                    <div className="details-content animate-in">
                      {isFavorite && (
                        <div className="analytics-cards" style={{ marginTop: '10px', display: 'flex', gap: '15px', marginBottom: '10px' }}>
                          <span>Min: {Math.min(...prices).toFixed(2)}€</span>
                          <span>Avg: {(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}€</span>
                          <span>Last: {prices[prices.length - 1].toFixed(2)}€</span>
                        </div>
                      )}
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
    {showHistory && (
        <PriceHistoryModal 
            productId={showHistory.id} 
            productName={showHistory.desc} 
            onClose={() => setShowHistory(null)} 
        />
    )}
    </>
  );
};

export default ComparisonTable;
