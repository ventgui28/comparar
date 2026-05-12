import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

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

const ComparisonTable = ({ comparisonData, activeFiles, onDeleteProduct }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <table className="pro-table">
      <thead>
        <tr>
          <th width="60"></th>
          <th>Descrição do Produto</th>
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
          const bestFile = activeFiles.find(f => f.id.toString() === bestFileId.toString());
          const isExpanded = expandedRows.has(item.id);

          return (
            <React.Fragment key={item.id}>
              <tr className="table-row">
                <td style={{ width: '40px', textAlign: 'center' }}>
                  <button 
                    onClick={() => onDeleteProduct(item.id)}
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
                  {prices.length > 1 && savings > 0 ? (
                    <div className="best-offer-chip" style={{ background: '#10b981', color: '#fff' }}>
                      -{savings.toFixed(2)}€
                    </div>
                  ) : (
                    <span style={{ color: '#e4e4e7' }}>---</span>
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
  );
};

export default ComparisonTable;
