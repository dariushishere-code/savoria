const API_BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.message ?? 'Request failed', data.code);
  }
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data as T;
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>(path, { token }),
  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'POST', body, token }),
  put: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'PUT', body, token }),
  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'PATCH', body, token }),
  delete: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: 'DELETE', token }),
};

/* ── Types ─────────────────────────────────────────────────────── */

export type RecipeListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: string;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  totalTimeMinutes: number | null;
  servings: number;
  calories: number | null;
  heroImageUrl: string | null;
  ratingAverage: number;
  ratingCount: number;
  favoriteCount: number;
  viewCount: number;
  publishedAt: string | null;
  cuisine: { id: string; name: string; slug: string } | null;
  country: { id: string; name: string; slug: string; flagEmoji: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type RecipeDetail = RecipeListItem & {
  mealType: string | null;
  tips: string | null;
  chefNotes: string | null;
  author: { id: string; name: string; avatarUrl: string | null } | null;
  ingredients: {
    id: string;
    name: string | null;
    amount: number | null;
    unit: string | null;
    note: string | null;
    group: string | null;
    sortOrder: number;
    optional: boolean;
    ingredient: { id: string; name: string } | null;
  }[];
  instructions: {
    id: string;
    stepNumber: number;
    title: string | null;
    content: string;
    imageUrl: string | null;
    timerSeconds: number | null;
    tip: string | null;
  }[];
  nutrition: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber: number | null;
  } | null;
  diets: { id: string; name: string; slug: string }[];
};

export type Cuisine = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region: string | null;
  heroImageUrl: string | null;
  _count: { recipes: number };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
};

export type Tag = { id: string; name: string; slug: string };

export type SearchSuggestion = {
  id: string;
  title: string;
  slug: string;
  heroImageUrl: string | null;
  cuisine: { name: string } | null;
};

/* ── API functions ─────────────────────────────────────────────── */

export function fetchRecipes(
  params?: Record<string, string | number | undefined>,
) {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  return api.get<{ data: RecipeListItem[]; meta: PaginationMeta }>(
    `/api/recipes${q ? `?${q}` : ''}`,
  );
}

export function fetchRecipe(slug: string) {
  return api.get<RecipeDetail>(`/api/recipes/${slug}`);
}

export function searchRecipes(
  params?: Record<string, string | number | undefined>,
) {
  const qs = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
  }
  const q = qs.toString();
  return api.get<{ data: RecipeListItem[]; meta: PaginationMeta }>(
    `/api/search${q ? `?${q}` : ''}`,
  );
}

export function searchSuggestions(q: string) {
  return api.get<{ recipes: SearchSuggestion[] }>(
    `/api/search/suggest?q=${encodeURIComponent(q)}`,
  );
}

export function fetchCuisines() {
  return api.get<Cuisine[]>('/api/cuisines');
}

export function fetchCategories() {
  return api.get<Category[]>('/api/categories');
}

export function fetchTags() {
  return api.get<Tag[]>('/api/tags');
}

export function fetchCountries() {
  return api.get<{ id: string; name: string; slug: string; flagEmoji: string | null }[]>('/api/countries');
}

/* ── Favorites ─────────────────────────────────────────────────── */

export function fetchFavorites(token: string, page = 1, pageSize = 20) {
  return api.get<{ data: RecipeListItem[]; meta: PaginationMeta }>(
    `/api/users/me/favorites?page=${page}&pageSize=${pageSize}`,
    token,
  );
}

export function addFavorite(recipeId: string, token: string) {
  return api.post<unknown>(`/api/users/me/favorites/${recipeId}`, {}, token);
}

export function removeFavorite(recipeId: string, token: string) {
  return api.delete<unknown>(`/api/users/me/favorites/${recipeId}`, token);
}

export function rateRecipe(recipeId: string, score: number, token: string) {
  return api.put<{ ratingAverage: number; ratingCount: number }>(`/api/recipes/${recipeId}/rating`, { score }, token);
}

export function fetchComments(recipeId: string, page = 1, pageSize = 20) {
  return api.get<{ data: { id: string; content: string; createdAt: string; user: { id: string; name: string; avatarUrl: string | null } }[]; meta: PaginationMeta }>(`/api/recipes/${recipeId}/comments?page=${page}&pageSize=${pageSize}`);
}

export function addComment(recipeId: string, content: string, token: string) {
  return api.post<{ id: string; content: string; status: string }>(`/api/recipes/${recipeId}/comments`, { content }, token);
}

/* ── AI ────────────────────────────────────────────────────────── */

export function aiChat(message: string, token?: string | null, conversationId?: string) {
  return api.post<{ reply: string }>(
    '/api/ai/chat',
    { message, conversationId },
    token,
  );
}

/* ── Helpers ───────────────────────────────────────────────────── */

export const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  EXPERT: 'Expert',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-50 text-green-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HARD: 'bg-orange-50 text-orange-700',
  EXPERT: 'bg-red-50 text-red-700',
};

export function formatTime(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Deterministic color from a string for placeholder images */
export function stringToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

