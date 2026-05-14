const MappingPreviewTable = ({
  data,
  ignoredRows,
  onToggleRow,
  handleCellClick,
  getCellClass,
}) => {
  // Derive colIndices and max cols from the data provided
  const maxCols = Math.max(...data.map(row => (row ? row.length : 0)), 0);
  const colIndices = Array.from({ length: maxCols }, (_, i) => i);

  return (
    <table className="preview-table clickable">
      <thead>
        <tr>
          <th className="sticky-header">#</th>
          {colIndices.map(i => <th key={i} className="sticky-header">{String.fromCharCode(65 + i)}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rIdx) => (
          <tr key={rIdx} className={ignoredRows.has(rIdx) ? 'ignored-row' : ''}>
            <td 
              onClick={() => onToggleRow(rIdx)}
              className="row-number-cell sticky-col"
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
  );
};

export default MappingPreviewTable;
