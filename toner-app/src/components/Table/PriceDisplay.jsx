const PriceDisplay = ({ price, isBest, trend }) => (
  <td className={`price-cell ${isBest ? 'best-price-bg' : ''}`}>
    {price ? (
      <div className="price-tag">
        <span className={`price-value ${isBest ? 'best-price' : ''}`}>
          {price.toFixed(2)}€
        </span>
        {isBest && <span className="best-label">Melhor Preço</span>}
        {trend && (
           <span className={`trend-badge ${trend.type}`} title={trend.type === 'min' ? 'Preço Mínimo Histórico' : `${trend.type === 'up' ? 'Aumento' : 'Queda'}: ${trend.percent.toFixed(1)}%`}>
             {trend.type === 'min' ? '🔥' : trend.type === 'up' ? '↑' : '↓'} 
             {Math.abs(trend.percent) >= 0.5 ? ` ${Math.abs(trend.percent).toFixed(0)}%` : ''}
           </span>
        )}
      </div>
    ) : (
      <span className="no-data">---</span>
    )}
  </td>
);

export default PriceDisplay;
