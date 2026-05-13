export const normalizeDescription = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\(.*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const normalizeReference = (ref) => {
  if (!ref) return '';
  return String(ref).toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

export const getProductKey = (item) => {
  return normalizeReference(item.ref) || normalizeDescription(item.desc);
};
