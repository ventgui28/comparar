const RowDetails = ({ item, activeFiles, isFavorite }) => {
  const prices = Object.values(item.prices).filter(p => p > 0);
  
  return (
    <tr className="row-details">
      <td colSpan={activeFiles.length + 6}>
        <div className="details-content animate-in">
          {isFavorite && prices.length > 0 && (
            <div className="analytics-bar">
              <div className="stat-card">
                <span className="stat-label">Mínimo</span>
                <span className="stat-value">{Math.min(...prices).toFixed(2)}€</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Média</span>
                <span className="stat-value">{(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}€</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Máximo</span>
                <span className="stat-value">{Math.max(...prices).toFixed(2)}€</span>
              </div>
            </div>
          )}
          
          <div className="references-grid">
            {Object.entries(item.refs).map(([fileId, ref]) => {
              const f = activeFiles.find(file => file.id.toString() === fileId.toString());
              return (
                <div key={fileId} className="ref-card">
                  <div className="ref-company-tag">{f?.name}</div>
                  <div className="ref-code-value">{ref}</div>
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
