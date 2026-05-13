const MappingPreviewTable = ({
  showRaw,
  currentData,
  previewRows,
  colIndices,
  ignoredRows,
  toggleIgnoreRow,
  handleCellClick,
  getCellClass
}) => {
  return (
    <div className="preview-container">
      {showRaw ? (
        <div style={{ padding: '2rem', background: '#18181b', color: '#10b981', fontFamily: 'monospace', fontSize: '0.8rem', overflow: 'auto', height: '100%' }}>
          <pre>{JSON.stringify(currentData.slice(0, 300), null, 2)}</pre>
        </div>
      ) : (
        <table className="preview-table clickable">
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, zIndex: 10, background: '#f8fafc' }}>#</th>
              {colIndices.map(i => <th key={i}>{String.fromCharCode(65 + i)}</th>)}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, rIdx) => (
              <tr key={rIdx} className={ignoredRows.has(rIdx) ? 'ignored-row' : ''}>
                <td 
                  onClick={() => toggleIgnoreRow(rIdx)}
                  className="row-number-btn"
                  style={{ position: 'sticky', left: 0, zIndex: 5, background: '#f8fafc', fontWeight: 800, cursor: 'pointer' }}
                >
                  {row.__rowIdx ?? rIdx + 1}
                </td>
                {colIndices.map(cIdx => (
                  <td key={cIdx} className={getCellClass(rIdx, cIdx)} onClick={() => handleCellClick(rIdx, cIdx)}>
                    {row && row[cIdx] !== undefined ? String(row[cIdx]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MappingPreviewTable;
