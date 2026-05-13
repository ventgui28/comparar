import { Star, TrendingUp, ShoppingCart } from 'lucide-react';
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
      <td className="action-cell">
        <button 
          onClick={() => onToggleFavorite(item.id)} 
          className={`btn-icon favorite ${isFavorite ? 'active' : ''}`}
        >
          <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </td>
      
      <td className="action-cell">
        {isFavorite && (
          <button 
            onClick={() => onShowHistory(item)} 
            className="btn-icon history"
            title="Ver Histórico de Preços"
          >
            <TrendingUp size={18} />
          </button>
        )}
      </td>
      
      <td className="cart-cell">
        <div className="cart-input-group">
          <input 
            type="number" 
            min="1" 
            defaultValue="1" 
            className="qty-input"
            id={`qty-${item.id}`}
          />
          <button 
            onClick={() => onAddToCart(item.id, document.getElementById(`qty-${item.id}`).value, bestFileId)}
            className="btn-add-cart-mini"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </td>
      
      <td className="product-info-cell" onClick={() => onToggleRow(item.id)}>
        <div className="product-name">{item.desc}</div>
        <div className="product-ref">REF: {bestRef}</div>
      </td>
      
      {activeFiles.map(f => (
        <PriceDisplay 
          key={f.id} 
          price={item.prices[f.id]} 
          isBest={item.prices[f.id] === minPrice && prices.length > 1} 
          trend={item.prices[f.id] === minPrice ? item.trend : null} 
        />
      ))}
      
      <td className="savings-cell">
        {prices.length > 1 && savings > 0 ? (
          <div className="savings-badge">
            -{savings.toFixed(2)}€
          </div>
        ) : (
          <span className="no-data">---</span>
        )}
      </td>
    </tr>
  );
};

export default TableRow;
