
const PriceDisplay = ({ price, isBest, trend }) => (
  <td className={isBest ? 'price-best' : 'price-normal'}>
    {price ? (
      <div className="price-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span className="price-value">{price.toFixed(2)}€</span>
        {trend && (
           <span className={`trend-badge ${trend.type}`} title={trend.type === 'min' ? 'Preço Mínimo Histórico' : `${trend.type === 'up' ? 'Aumento' : 'Queda'}: ${trend.percent.toFixed(1)}%`}>
             {trend.type === 'min' ? '🔥' : trend.type === 'up' ? '↑' : '↓'} 
             {Math.abs(trend.percent) >= 0.5 ? ` ${Math.abs(trend.percent).toFixed(0)}%` : ''}
           </span>
        )}
      </div>
    ) : (
      <span className="price-none" style={{ color: '#e4e4e7' }}>---</span>
    )}
  </td>
);

export default PriceDisplay;
