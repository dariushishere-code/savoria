import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Check, Info, X, XCircle } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

type Toast = {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
};

type ToastInput = { title: string; message?: string };

type ToastApi = {
  push: (kind: ToastKind, input: ToastInput) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

let sequence = 0;
const listeners = new Set<(kind: ToastKind, input: ToastInput) => void>();

/** Module-level helpers — usable from any event handler without hooks. */
export const toast = {
  success: (title: string, message?: string) => emit('success', { title, message }),
  error: (title: string, message?: string) => emit('error', { title, message }),
  info: (title: string, message?: string) => emit('info', { title, message }),
};

function emit(kind: ToastKind, input: ToastInput) {
  listeners.forEach((listener) => listener(kind, input));
}

const ICONS: Record<ToastKind, ReactNode> = {
  success: <Check className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

function ToastCard({ toastItem, onDismiss }: { toastItem: Toast; onDismiss: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    window.setTimeout(onDismiss, 260);
  }, [onDismiss]);

  useEffect(() => {
    const timer = window.setTimeout(dismiss, 4200);
    return () => window.clearTimeout(timer);
  }, [dismiss]);

  return (
    <div
      className={`toast is-${toastItem.kind} ${leaving ? 'is-leaving' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon">{ICONS[toastItem.kind]}</span>
      <div className="toast-body">
        <strong>{toastItem.title}</strong>
        {toastItem.message && <p>{toastItem.message}</p>}
      </div>
      <button type="button" className="toast-close" onClick={dismiss} aria-label="Dismiss">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const listener = (kind: ToastKind, input: ToastInput) => {
      counter.current += 1;
      const id = counter.current;
      setItems((current) => [...current.slice(-3), { id, kind, ...input }]);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ push: emit, dismiss }), [dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {items.length > 0 && (
        <div className="toast-viewport" role="region" aria-label="Notifications">
          {items.map((item) => (
            <ToastCard key={item.id} toastItem={item} onDismiss={() => dismiss(item.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast requires ToastProvider');
  return ctx;
}