import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="fixed top-24 right-4 z-[10000] flex flex-col gap-2 pointer-events-none max-w-sm">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className="animate-slide-up pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white border border-gold/30 shadow-[0_8px_30px_rgba(56,3,17,0.15)] rounded-sm min-w-[280px]"
        >
          {toast.type === 'success' && <CheckCircle className="text-green-600 shrink-0" size={20} />}
          {toast.type === 'error' && <AlertCircle className="text-red-600 shrink-0" size={20} />}
          {toast.type === 'info' && <Info className="text-blue-600 shrink-0" size={20} />}
          
          <span className="flex-1 font-cinzel text-sm font-semibold text-maroon-dk">{toast.msg}</span>
          
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-maroon transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
