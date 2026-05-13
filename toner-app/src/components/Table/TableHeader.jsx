import { Star, TrendingUp, ShoppingCart } from 'lucide-react';

const TableHeader = ({ activeFiles }) => (
  <thead>
    <tr>
      <th className="action-cell"><Star size={14} /></th>
      <th className="action-cell"><TrendingUp size={14} /></th>
      <th className="cart-cell"><ShoppingCart size={14} /></th>
      <th>Produto</th>
      {activeFiles.map(f => <th key={f.id} className="price-cell">{f.name}</th>)}
      <th className="savings-cell">Poupança</th>
    </tr>
  </thead>
);

export default TableHeader;
