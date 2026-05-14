import * as XLSX from 'xlsx';

const NON_PRICE_CHARS_REGEX = /[^\d.,]/g;
const ALL_DOTS_REGEX = /\./g;
const HEADER_THRESHOLD_ROWS = 20;

/**
 * Filtro inteligente para validar se uma linha é útil.
 * @param {Array} row - Valores da linha.
 * @param {boolean} isHeaderPhase - Se estamos nas primeiras linhas (cabeçalho).
 */
const isValidRow = (row, isHeaderPhase) => {
  const isNotEmpty = row.some(val => val !== "" && val !== null && val !== undefined);
  const containsPrice = row.some(val => typeof val === 'number' && val > 0 && val < 10000);
  
  return isNotEmpty && (containsPrice || isHeaderPhase);
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

            const isHeaderPhase = visibleRows.length < HEADER_THRESHOLD_ROWS;
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

  const limit = (endRow !== null && endRow !== undefined) ? Math.min(rows.length, endRow + 1) : rows.length;

  for (let i = startRow; i < limit; i++) {
    const row = rows[i];
    if (row) {
      const ref = String(row[refCol] || '').trim();
      const desc = String(row[descCol] || '').trim();
      const price = parsePrice(row[priceCol]);

      // Permite produtos que tenham pelo menos uma identificação (ref ou desc) e preço
      if ((ref || desc) && price > 0) {
        products.push({ ref, desc, price, fileName, rowIdx: row.__rowIdx || (i + 1) });
      }
    }
  }
  return products;
};

/**
 * Normaliza valores de preço de strings ou números.
 * Suporta formatos 1.234,56 e 1234,56.
 */
export const parsePrice = (val) => {
  if (val === undefined || val === null || val === "") return 0;
  if (typeof val === 'number') return val;

  const sanitized = String(val).trim().replace(NON_PRICE_CHARS_REGEX, '');
  
  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');

  let normalized = sanitized;
  if (hasComma && hasDot) {
    // Formato Europeu: 1.234,56 -> 1234.56
    normalized = sanitized.replace(ALL_DOTS_REGEX, '').replace(',', '.');
  } else if (hasComma) {
    // Formato Simples: 1234,56 -> 1234.56
    normalized = sanitized.replace(',', '.');
  }

  const result = parseFloat(normalized);
  return isNaN(result) ? 0 : result;
};

/**
 * Converte as seleções brutas (coordenadas start/end) num objeto de mapeamento finalizado.
 */
export const finalizeMapping = (selections) => {
  const allStarts = [selections.ref.start?.r, selections.name.start?.r, selections.price.start?.r];
  const allEnds = [selections.ref.end?.r, selections.name.end?.r, selections.price.end?.r];

  return {
    ref: selections.ref.start?.c,
    desc: selections.name.start?.c,
    price: selections.price.start?.c,
    startRow: Math.min(...allStarts.filter(r => r != null)),
    endRow: allEnds.some(e => e != null) ? Math.max(...allEnds.filter(e => e != null)) : null
  };
};
