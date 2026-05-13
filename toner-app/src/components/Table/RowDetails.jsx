
const RowDetails = ({ item, activeFiles, isFavorite }) => {
  const prices = Object.values(item.prices).filter(p => p > 0);
  
  return (
    <tr className="row-details">
      <td colSpan={activeFiles.length + 6}>
        <div className="details-content animate-in">
          {isFavorite && prices.length > 0 && (
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
  );
};

export default RowDetails;
