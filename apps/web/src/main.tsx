import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/auth';
import { App } from './App';
import { EntranceLoader, SmoothScrollProvider } from './lib/motion';
import { ToastProvider } from './lib/toast';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SmoothScrollProvider>
          <AuthProvider>
            <ToastProvider>
              <EntranceLoader />
              <App />
            </ToastProvider>
          </AuthProvider>
        </SmoothScrollProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
