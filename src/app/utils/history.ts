export interface SavedSegment {
  original: string;
  translated: string;
  start?: number;
  end?: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  audioPath: string;
  createdAt: number;
  segments: SavedSegment[];
}

const STORAGE_KEY = 'transcribe.history.v1';

export function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addHistory(item: HistoryItem) {
  const cur = loadHistory();
  cur.unshift(item);
  saveHistory(cur.slice(0, 50));
}

export function removeHistory(id: string) {
  const cur = loadHistory();
  const next = cur.filter((i) => i.id !== id);
  saveHistory(next);
}
