import * as XLSX from 'xlsx';

const JUNK_KEYWORDS = [
  'tabela de compra', 'legenda', 'data de publicação', 
  'ao remeter esta tabela', 'condições comerciais', 'happygreen',
  'referência', 'descrição', 'quant.', 'preço un.', 'subtotal'
];

/**
 * Filtro inteligente para validar se uma linha é útil.
 * @param {Array} row - Valores da linha.
 * @param {boolean} isHeaderPhase - Se estamos nas primeiras linhas (cabeçalho).
 */
const isValidRow = (row, isHeaderPhase) => {
  const hasData = row.some(val => val !== "" && val !== null && val !== undefined);
  const isJunk = row.some(val => JUNK_KEYWORDS.some(kw => String(val).toLowerCase().includes(kw)));
  const hasPriceLikeNumber = row.some(val => typeof val === 'number' && val > 0 && val < 10000);
  
  if (!hasData || isJunk) return false;
  return hasPriceLikeNumber || isHeaderPhase;
};

export const readRawExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellFormula: false, cellNF: true });
        
        const sheetsData = {};
        const visibleSheetNames = [];
        const sheetProps = workbook.Workbook ? workbook.Workbook.Sheets : [];
        
        workbook.SheetNames.forEach((name, idx) => {
          const isSheetHidden = sheetProps[idx] && sheetProps[idx].Hidden && sheetProps[idx].Hidden !== 0;
          if (isSheetHidden) return;

          visibleSheetNames.push(name);
          const worksheet = workbook.Sheets[name];
          const rowsMeta = worksheet['!rows'] || [];
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z5000');
          
          const visibleRows = [];
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const meta = rowsMeta[R];
            const isRowHidden = meta && (meta.hidden === true || meta.hpt === 0 || meta.hpx === 0);
            if (isRowHidden) continue;

            const row = [];
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
              const cell = worksheet[cellRef];
              row.push(cell ? cell.v : "");
            }

            const isHeaderPhase = visibleRows.length < 20;
            if (isValidRow(row, isHeaderPhase)) {
              row.__rowIdx = R + 1;
              visibleRows.push(row);
            }
          }
          sheetsData[name] = visibleRows;
        });

        resolve({ sheetNames: visibleSheetNames, sheetsData: sheetsData });
      } catch (error) {
        reject(new Error("Erro ao ler Excel."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const parseWithMapping = (rows, mapping, fileName) => {
  const products = [];
  const { ref: refCol, desc: descCol, price: priceCol, startRow, endRow } = mapping;

  // Se endRow for nulo, processamos até o fim das linhas visíveis
  const limit = (endRow !== null && endRow !== undefined) ? Math.min(rows.length, endRow + 1) : rows.length;

  for (let i = startRow; i < limit; i++) {
    const row = rows[i];
    if (row) {
      const ref = String(row[refCol] || '').trim();
      const desc = String(row[descCol] || '').trim();
      const price = parsePrice(row[priceCol]);

      if (ref && desc && price > 0) {
        products.push({ ref, desc, price, fileName, rowIdx: row.__rowIdx || (i + 1) });
      }
    }
  }
  return products;
};

const parsePrice = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === 'number') return val;
  let s = String(val).trim().replace(/[^\d.,]/g, ''); 
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  const parsed = parseFloat(s.replace(/[^\d.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};
