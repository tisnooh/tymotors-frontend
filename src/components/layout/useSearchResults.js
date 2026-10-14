import { useEffect, useState } from 'react';
import { Products } from '@/lib/api';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH, SEARCH_PREVIEW_LIMIT } from '@/lib/search';

const EMPTY = { query: '', status: 'idle', items: [], total: null };

export function useSearchResults(open, query, retry) {
  const [state, setState] = useState(EMPTY);
  useEffect(() => {
    if (!open || query.length < SEARCH_MIN_LENGTH) { setState(EMPTY); return undefined; }
    let cancelled = false;
    setState({ ...EMPTY, query, status: 'loading' });
    const timer = setTimeout(async () => {
      try {
        const data = await Products.list({ q: query, limit: SEARCH_PREVIEW_LIMIT });
        if (cancelled) return;
        if (!Array.isArray(data?.items)) throw new Error('Invalid catalogue response');
        setState({ query, status: 'success', items: data.items,
          total: Number.isInteger(data.total) && data.total >= data.items.length ? data.total : null });
      } catch {
        if (!cancelled) setState({ ...EMPTY, query, status: 'error' });
      }
    }, SEARCH_DEBOUNCE_MS);
    // Already-started GETs cannot update a newer query, a cleared input or a
    // closed/unmounted panel. No query/error payload is stored or logged.
    return () => { cancelled = true; clearTimeout(timer); };
  }, [open, query, retry]);
  if (open && query.length >= SEARCH_MIN_LENGTH && state.query !== query) return { ...EMPTY, query, status: 'loading' };
  return state;
}
