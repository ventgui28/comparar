import { useState, Fragment } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import RowDetails from './RowDetails';

const ComparisonTable = ({ 
  comparisonData, 
  activeFiles, 
  onAddToCart, 
  favorites, 
  onToggleFavorite,
  onShowHistory,
  onShowMerge,
  onUnmerge,
  aliases
}) => {
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
      <TableHeader activeFiles={activeFiles} />
      <tbody>
        {comparisonData.map((item) => {
          const isExpanded = expandedRows.has(item.id);
          const isFavorite = favorites?.includes(item.id);

          return (
            <Fragment key={item.id}>
              <TableRow 
                item={item}
                activeFiles={activeFiles}
                onAddToCart={onAddToCart}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
                onShowHistory={onShowHistory}
                onShowMerge={onShowMerge}
                onUnmerge={onUnmerge}
                onToggleRow={toggleRow}
                aliases={aliases}
              />
              {isExpanded && (
                <RowDetails 
                  item={item} 
                  activeFiles={activeFiles} 
                  isFavorite={isFavorite} 
                />
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default ComparisonTable;
