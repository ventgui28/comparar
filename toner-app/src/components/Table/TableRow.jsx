import PriceDisplay from './PriceDisplay';

const TableRow = ({ 
  item, 
  activeFiles, 
  onAddToCart, 
  isFavorite, 
  onToggleFavorite, 
  onShowHistory, 
  onToggleRow 
}) => {
  const prices = Object.values(item.prices).filter(p => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const savings = maxPrice - minPrice;
  const bestFileId = Object.keys(item.prices).find(id => item.prices[id] === minPrice);
  const bestRef = item.refs[bestFileId];

  return (
    <tr className="table-row">
      <td style={{ textAlign: 'center' }}>
        <button onClick={() => onToggleFavorite(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
          {isFavorite ? '⭐' : '☆'}
        </button>
      </td>
      <td style={{ textAlign: 'center' }}>
        {isFavorite && (
          <button onClick={() => onShowHistory(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}>
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
            onClick={() => onAddToCart(item.id, document.getElementById(`qty-${item.id}`).value, bestFileId)}
            className="btn-add-cart"
          >
            +
          </button>
        </div>
      </td>
      <td onClick={() => onToggleRow(item.id)}>
        <div className="product-name">{item.desc}</div>
        <div className="product-subtext">
           Ficheiro: <strong>{activeFiles.find(f => item.prices[f.id])?.name}</strong> (Linha {item.rowNumbers[Object.keys(item.rowNumbers)[0]]})
        </div>
      </td>
      <td>
          <div className="ref-code" style={{ fontWeight: 600, color: 'var(--success)' }}>{bestRef}</div>
      </td>
      {activeFiles.map(f => (
        <PriceDisplay 
          key={f.id} 
          price={item.prices[f.id]} 
          isBest={item.prices[f.id] === minPrice && prices.length > 1} 
          trend={item.prices[f.id] === minPrice ? item.trend : null} 
        />
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
  );
};

export default TableRow;
