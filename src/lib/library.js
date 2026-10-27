export function isMovieId(id) {
  return /^([1-9]|1[0-9]|20)$/.test(id);
}
export function emptyRecord() {
  return { favorite: false, status: 'none', updatedAt: 0 };
}
export function validRecord(value) {
  if (!value || typeof value !== 'object') return false;
  const record = value;
  return (
    typeof record.favorite === 'boolean' &&
    ['none', 'watchlist', 'watched'].includes(record.status) &&
    Number.isFinite(record.updatedAt) &&
    record.updatedAt >= 0
  );
}
