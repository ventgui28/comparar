import { useState, Fragment } from 'react';
import PriceHistoryModal from '../shared/PriceHistoryModal';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import RowDetails from './RowDetails';

const ComparisonTable = ({ 
  comparisonData, 
  activeFiles, 
  onAddToCart, 
  favorites, 
  onToggleFavorite 
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showHistory, setShowHistory] = useState(null);

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
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
                  onShowHistory={setShowHistory}
                  onToggleRow={toggleRow}
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
      {showHistory && (
        <PriceHistoryModal 
          productId={showHistory.id} 
          productName={showHistory.desc} 
          onClose={() => setShowHistory(null)} 
        />
      )}
    </>
  );
};

export default ComparisonTable;
