export type WatchStatus = 'none' | 'watchlist' | 'watched';
export type LibraryRecord = { favorite: boolean; status: WatchStatus; updatedAt: number };
export type PendingRecord = LibraryRecord & { revision: number };
export type LibraryRecords = Record<string, LibraryRecord>;
export const isMovieId = (id: string) => /^([1-9]|1[0-4])$/.test(id);
export const emptyRecord = (): LibraryRecord => ({ favorite: false, status: 'none', updatedAt: 0 });

export function nextDurableWrite(pending: Record<string, PendingRecord>, durable: Record<string, number>) {
  return Object.entries(pending).find(([id, record]) => durable[id] === record.revision);
}

export function validRecord(value: unknown): value is LibraryRecord {
  if (!value || typeof value !== 'object') return false;
  const record = value as LibraryRecord;
  return typeof record.favorite === 'boolean'
    && ['none', 'watchlist', 'watched'].includes(record.status)
    && Number.isFinite(record.updatedAt) && record.updatedAt >= 0;
}

export function mergeLibrary(records: LibraryRecords, legacy: string[], pending: Record<string, PendingRecord>): LibraryRecords {
  const merged = { ...records };
  for (const id of legacy) {
    if (isMovieId(id) && !merged[id]) merged[id] = { ...emptyRecord(), favorite: true };
  }
  return { ...merged, ...pending };
}

export function decodeLibraryCache(raw: string | null): { records: LibraryRecords; pending: Record<string, PendingRecord> } {
  const result = { records: {} as LibraryRecords, pending: {} as Record<string, PendingRecord> };
  try {
    const data = JSON.parse(raw || '{}');
    if (data.version !== 1) return result;
    for (const [id, value] of Object.entries(data.records || {})) {
      if (isMovieId(id) && validRecord(value)) result.records[id] = value;
    }
    for (const [id, value] of Object.entries(data.pending || {})) {
      if (isMovieId(id) && validRecord(value) && Number.isSafeInteger((value as PendingRecord).revision)) result.pending[id] = value as PendingRecord;
    }
  } catch { /* A damaged local cache must not prevent browsing. */ }
  return result;
}
