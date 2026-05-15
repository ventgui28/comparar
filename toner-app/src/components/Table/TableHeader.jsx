import { Star, Link, ShoppingCart } from 'lucide-react';

const TableHeader = ({ activeFiles }) => (
  <thead>
    <tr>
      <th className="action-cell"><Star size={14} /></th>
      <th className="action-cell"><Link size={14} /></th>
      <th className="cart-cell"><ShoppingCart size={14} /></th>
      <th>Toner/Tinteiro</th>
      {activeFiles.map(f => <th key={f.id} className="price-cell">{f.name}</th>)}
      <th className="savings-cell">Poupança</th>
    </tr>
  </thead>
);

export default TableHeader;
