const PriceDisplay = ({ price, isBest }) => (
  <td className={`price-cell ${isBest ? 'best-price-bg' : ''}`}>
    {price ? (
      <div className="price-tag">
        <span className={`price-value ${isBest ? 'best-price' : ''}`}>
          {price.toFixed(2)}€
        </span>
        {isBest && <span className="best-label">Melhor Preço</span>}
      </div>
    ) : (
      <span className="no-data">---</span>
    )}
  </td>
);

export default PriceDisplay;
