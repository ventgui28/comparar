
const TableHeader = ({ activeFiles }) => (
  <thead>
    <tr>
      <th width="40">Favorito</th>
      <th width="40">Histórico</th>
      <th width="120">Carrinho</th>
      <th>Descrição do Produto</th>
      <th width="150">Ref. Melhor Preço</th>
      {activeFiles.map(f => <th key={f.id} className="col-price">{f.name}</th>)}
      <th width="150" style={{ textAlign: 'center' }}>Poupança</th>
    </tr>
  </thead>
);

export default TableHeader;
