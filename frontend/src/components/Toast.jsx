import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => setToast((current) => (current && current.id === id ? null : current)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toast && (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
