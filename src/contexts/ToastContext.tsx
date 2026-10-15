// src/contexts/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import '../ui/Toast.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps>({} as ToastContextProps);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Automaattinen poisto 4 sekunnin kuluttua
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="corbe-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`corbe-toast corbe-toast--${toast.type}`}>
            <span className="corbe-toast-title">{toast.title}</span>
            <span className="corbe-toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);