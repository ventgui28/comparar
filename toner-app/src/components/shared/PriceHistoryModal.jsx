import { useEffect, useState } from 'react';
import { X, Calendar, Euro } from 'lucide-react';
import { getPriceHistory } from '../../utils/db';

const PriceHistoryModal = ({ productId, productName, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPriceHistory(productId).then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, [productId]);

  return (
    <div className="modal-overlay">
      <div className="modal-content history-modal animate-in">
        <header className="cart-header">
          <div className="cart-title">
            <h3>Histórico: {productName}</h3>
          </div>
          <button onClick={onClose} className="btn-close"><X size={20}/></button>
        </header>
        
        <div className="modal-body-scroll">
          {loading ? (
            <div className="loading-state">
              <p>A carregar histórico...</p>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th><Calendar size={14} /> Data</th>
                  <th className="price-cell"><Euro size={14} /> Preço</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? history.map((h, i) => {
                  const d = new Date(h.date);
                  const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                  return (
                    <tr key={i}>
                      <td className="date-cell">{formattedDate}</td>
                      <td className="price-cell">
                        <span className="price-value">{h.price.toFixed(2)}€</span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="2" className="empty-history">Sem histórico registado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;
