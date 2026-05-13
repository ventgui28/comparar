import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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
      <div className="modal-content animate-in">
        <div className="wizard-header">
          <h3>Histórico: {productName}</h3>
          <button onClick={onClose} className="btn-cancel"><X size={18}/></button>
        </div>
        
        <div className="preview-container" style={{ padding: '1rem' }}>
          {loading ? <p>A carregar...</p> : (
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Preço</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? history.map((h, i) => {
                  const d = new Date(h.date);
                  const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                  return (
                    <tr key={i}>
                      <td>{formattedDate}</td>
                      <td>{h.price.toFixed(2)}€</td>
                    </tr>
                  );
                }) : <tr><td colSpan="2">Sem histórico registado.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;
