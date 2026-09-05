import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ApiError,
  fetchRecipes,
  type PaginationMeta,
  type RecipeListItem,
} from '../lib/api';

type RecipeFilters = {
  q?: string;
  cuisine?: string;
  category?: string;
  difficulty?: string;
  dietary?: string;
  sort?: string;
};

type State = {
  data: RecipeListItem[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: ApiError | null;
};

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

/**
 * Paginated recipe listing with debounced search and filter support.
 * Pass eager results (from a server fetch) to render instantly.
 */
export function useRecipes(initial?: RecipeListItem[]) {
  const [filters, setFilters] = useState<RecipeFilters>({ sort: 'featured' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState<State>({
    data: initial ?? [],
    meta: EMPTY_META,
    loading: !initial,
    error: null,
  });

  const debounceRef = useRef<number | null>(null);

  const load = useCallback((nextPage = 1, nextFilters = filters) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    fetchRecipes({ ...nextFilters, page: nextPage, pageSize: 12 })
      .then((result) => {
        setState({ data: result.data, meta: result.meta, loading: false, error: null });
        setPage(nextPage);
      })
      .catch((error: unknown) => {
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof ApiError ? error : new ApiError(0, 'Could not load recipes'),
        }));
      });
  }, [filters]);

  useEffect(() => {
    const hasQuery = (filters.q ?? '').trim().length > 0;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setState((current) => ({ ...current, loading: true }));
      load(1, filters);
    }, hasQuery ? 320 : 0);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [filters, load]);

  const setFilter = useCallback((patch: Partial<RecipeFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const goToPage = useCallback(
    (next: number) => {
      if (next === page || next < 1) return;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      load(next);
    },
    [load, page],
  );

  return { ...state, filters, setFilter, page, goToPage };
}