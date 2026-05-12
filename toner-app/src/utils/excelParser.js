import * as XLSX from 'xlsx';

const JUNK_KEYWORDS = [
  'tabela de compra', 'legenda', 'data de publicação', 
  'ao remeter esta tabela', 'condições comerciais', 'happygreen',
  'referência', 'descrição', 'quant.', 'preço un.', 'subtotal'
];

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
          
          if (!isSheetHidden) {
            visibleSheetNames.push(name);
            const worksheet = workbook.Sheets[name];
            const rowsMeta = worksheet['!rows'] || [];
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z5000');
            
            const visibleRows = [];
            for (let R = range.s.r; R <= range.e.r; ++R) {
              const meta = rowsMeta[R];
              const isRowHidden = meta && (meta.hidden === true || meta.hpt === 0 || meta.hpx === 0);
              
              if (!isRowHidden) {
                const row = [];
                let hasData = false;
                let hasPriceLikeNumber = false;
                let isJunk = false;

                for (let C = range.s.c; C <= range.e.c; ++C) {
                  const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                  const cell = worksheet[cellRef];
                  const rawVal = cell ? cell.v : "";
                  const val = String(rawVal).trim();
                  
                  if (val !== "") {
                    hasData = true;
                    if (JUNK_KEYWORDS.some(kw => val.toLowerCase().includes(kw))) isJunk = true;
                    // Se encontrarmos algo que pareça um preço (número), marcamos a linha como útil
                    if (typeof rawVal === 'number' && rawVal > 0 && rawVal < 10000) hasPriceLikeNumber = true;
                  }
                  row.push(val);
                }

                // FILTRO INTELIGENTE: 
                // Só aceitamos a linha se:
                // 1. Tiver dados
                // 2. Não for uma linha de junk (cabeçalho/legenda)
                // 3. Tiver pelo menos UM número que pareça um preço (ou se for a linha do cabeçalho da tabela)
                if (hasData && !isJunk) {
                  // Se a linha tem um número ou se estamos nas primeiras 20 linhas (para deixar ver o cabeçalho no preview)
                  if (hasPriceLikeNumber || visibleRows.length < 20) {
                    row.__rowIdx = R + 1;
                    visibleRows.push(row);
                  }
                }
              }
            }
            sheetsData[name] = visibleRows;
          }
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

  // If endRow is null, we process until the end of the visible array
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
