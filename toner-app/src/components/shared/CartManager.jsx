import * as XLSX from 'xlsx';
import { X, FileDown, Plus, Minus, Trash2 } from 'lucide-react';

export const CartManager = ({ cart, products, activeFiles, isOpen, onClose, onUpdateCart }) => {
  if (!isOpen) return null;

  const totalSavings = Object.entries(cart).reduce((acc, [prodId, { qty, shopId }]) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return acc;
    const prices = Object.values(prod.prices).filter(p => p > 0);
    const maxPrice = Math.max(...prices);
    return acc + (maxPrice - prod.prices[shopId]) * qty;
  }, 0);

  const totalAmount = Object.entries(cart).reduce((acc, [prodId, { qty, shopId }]) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return acc;
    return acc + (prod.prices[shopId] * qty);
  }, 0);

  const exportCart = () => {
    const wb = XLSX.utils.book_new();
    const grouped = {};

    Object.entries(cart).forEach(([prodId, { qty, shopId }]) => {
      if (!grouped[shopId]) grouped[shopId] = [];
      const prod = products.find(p => p.id === prodId);
      if (prod) {
        grouped[shopId].push({
          'Referência': prod.refs[shopId],
          'Descrição': prod.desc,
          'Quantidade': qty,
          'Preço Un.': Number(prod.prices[shopId].toFixed(2)),
          'Total': Number((qty * prod.prices[shopId]).toFixed(2))
        });
      }
    });

    Object.entries(grouped).forEach(([shopId, items]) => {
      const file = activeFiles.find(f => String(f.id) === String(shopId));
      const ws = XLSX.utils.json_to_sheet(items);
      const sheetName = (file?.name || `Loja_${shopId}`).substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, 'Carrinho_Compras.xlsx');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content cart-modal animate-in">
        <header className="cart-header">
          <div className="cart-title">
            <h3>O teu Carrinho</h3>
            <span className="badge">{Object.keys(cart).length} itens</span>
          </div>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </header>

        <div className="cart-body">
          {Object.keys(cart).length === 0 ? (
            <div className="empty-cart">
              <p>O teu carrinho está vazio.</p>
            </div>
          ) : (
            <ul className="cart-list">
              {Object.entries(cart).map(([prodId, { qty, shopId }]) => {
                const prod = products.find(p => p.id === prodId);
                const price = prod?.prices[shopId] || 0;
                return (
                  <li key={prodId} className="cart-item">
                    <div className="item-info">
                      <div className="item-name">{prod?.desc}</div>
                      <div className="item-meta">
                        <span className="item-price">{price.toFixed(2)}€</span>
                        <span className="item-multiply">×</span>
                        <span className="item-qty">{qty}</span>
                        <span className="item-total">{(price * qty).toFixed(2)}€</span>
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <div className="qty-controls">
                        <button onClick={() => onUpdateCart(prodId, qty - 1)} className="btn-qty"><Minus size={14} /></button>
                        <span className="qty-value">{qty}</span>
                        <button onClick={() => onUpdateCart(prodId, qty + 1)} className="btn-qty"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => onUpdateCart(prodId, 0)} className="btn-remove" title="Remover item">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="cart-footer">
          <div className="cart-summary">
            <div className="summary-row">
              <span>Total</span>
              <span className="total-value">{totalAmount.toFixed(2)}€</span>
            </div>
            {totalSavings > 0 && (
              <div className="summary-row savings">
                <span>Poupas</span>
                <span className="savings-value">-{totalSavings.toFixed(2)}€</span>
              </div>
            )}
          </div>
          <button onClick={exportCart} className="btn-primary btn-block" disabled={Object.keys(cart).length === 0}>
            <FileDown size={18} />
            Exportar Carrinho (Excel)
          </button>
        </footer>
      </div>
    </div>
  );
};
