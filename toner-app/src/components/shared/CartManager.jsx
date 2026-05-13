import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export const CartManager = ({ cart, products, activeFiles, isOpen, onClose, onUpdateCart }) => {
  if (!isOpen) return null;

  const totalSavings = Object.entries(cart).reduce((acc, [prodId, { qty, shopId }]) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return acc;
    const prices = Object.values(prod.prices).filter(p => p > 0);
    const maxPrice = Math.max(...prices);
    return acc + (maxPrice - prod.prices[shopId]) * qty;
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

    // Create a sheet for every active file, even if empty (optional, but cleaner)
    // Or just for shops that have items:
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
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Carrinho ({Object.keys(cart).length} itens)</h3>
        <p>Poupança Total: {totalSavings.toFixed(2)}€</p>
        <ul className="cart-list">
          {Object.entries(cart).map(([prodId, { qty, shopId }]) => {
            const prod = products.find(p => p.id === prodId);
            const price = prod?.prices[shopId] || 0;
            return (
              <li key={prodId} style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f4f5' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{prod?.desc}</div>
                  <div style={{ fontSize: '0.8rem', color: '#71717a' }}>
                    {price.toFixed(2)}€ x {qty} = <strong>{(price * qty).toFixed(2)}€</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button onClick={() => onUpdateCart(prodId, qty - 1)} className="btn-qty">-</button>
                  <span style={{ minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => onUpdateCart(prodId, qty + 1)} className="btn-qty">+</button>
                  <button onClick={() => onUpdateCart(prodId, 0)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}>
                    Remover
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <button onClick={exportCart} className="btn-primary">Exportar Excel</button>
      </div>
    </div>
  );
};
