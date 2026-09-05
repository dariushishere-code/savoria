import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, ApiError, onAccessTokenChange } from './api';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Keep the app in sync with silent token refreshes performed by the
     API client (and clear the session if a refresh irrevocably fails). */
  useEffect(() => {
    const unsubscribe = onAccessTokenChange((token) => {
      if (token) {
        setAccessToken(token);
      } else {
        setAccessToken(null);
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api.post<{ accessToken: string }>('/api/auth/refresh');
      setAccessToken(data.accessToken);
      const me = await api.get<AuthUser>('/api/users/me', data.accessToken);
      setUser(me);
      return true;
    } catch {
      setAccessToken(null);
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const data = await api.post<{ user: AuthUser; accessToken: string }>(
        '/api/auth/login',
        { email, password },
      );
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const register = useCallback(
    async (input: { email: string; password: string; name: string }): Promise<AuthUser> => {
      await api.post('/api/auth/register', input);
      return login(input.email, input.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: !!user && !!accessToken,
      isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
      login,
      register,
      logout,
    }),
    [user, accessToken, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth requires AuthProvider');
  return ctx;
}

export { ApiError };
