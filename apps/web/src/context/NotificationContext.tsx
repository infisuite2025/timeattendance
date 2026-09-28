import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  HelpCircle,
  Trash2,
  Check,
  Sparkles
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type SweetAlertIcon = 'success' | 'warning' | 'error' | 'info' | 'question' | 'delete';

export interface SweetAlertOptions {
  title: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  isDangerous?: boolean;
  confirmButtonColor?: string;
}

interface NotificationContextType {
  toast: {
    success: (title: string, message?: string, duration?: number) => void;
    error: (title: string, message?: string, duration?: number) => void;
    warning: (title: string, message?: string, duration?: number) => void;
    info: (title: string, message?: string, duration?: number) => void;
  };
  confirm: (options: SweetAlertOptions) => Promise<boolean>;
  alert: (title: string, text?: string, icon?: SweetAlertIcon) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    options: SweetAlertOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { id, type, title, message, duration };

    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title: string, message?: string, duration = 4000) => addToast('success', title, message, duration),
    error: (title: string, message?: string, duration = 4500) => addToast('error', title, message, duration),
    warning: (title: string, message?: string, duration = 4500) => addToast('warning', title, message, duration),
    info: (title: string, message?: string, duration = 4000) => addToast('info', title, message, duration)
  };

  const confirm = useCallback((options: SweetAlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertConfig({
        options: {
          showCancelButton: true,
          confirmButtonText: 'Yes, Proceed',
          cancelButtonText: 'Cancel',
          icon: 'question',
          ...options
        },
        resolve
      });
    });
  }, []);

  const alert = useCallback((title: string, text?: string, icon: SweetAlertIcon = 'info'): Promise<void> => {
    return new Promise((resolve) => {
      setAlertConfig({
        options: {
          title,
          text,
          icon,
          showCancelButton: false,
          confirmButtonText: 'OK'
        },
        resolve: () => resolve()
      });
    });
  }, []);

  const handleAlertConfirm = () => {
    if (alertConfig) {
      alertConfig.resolve(true);
      setAlertConfig(null);
    }
  };

  const handleAlertCancel = () => {
    if (alertConfig) {
      alertConfig.resolve(false);
      setAlertConfig(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ toast, confirm, alert }}>
      {children}

      {/* Floating Toast Portal */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all animate-in slide-in-from-top-4 duration-200 ${
              t.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-slate-800'
                : t.type === 'error'
                ? 'bg-white/95 border-rose-200 text-slate-800'
                : t.type === 'warning'
                ? 'bg-white/95 border-amber-200 text-slate-800'
                : 'bg-white/95 border-blue-200 text-slate-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {t.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {t.type === 'warning' && (
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {t.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 text-left min-w-0">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">{t.title}</h4>
              {t.message && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* SweetAlert2 Modal Dialog */}
      {alertConfig && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-150">
            {/* Animated Icon Avatar */}
            <div className="mx-auto flex items-center justify-center">
              {alertConfig.options.icon === 'success' && (
                <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
              )}
              {alertConfig.options.icon === 'warning' && (
                <div className="w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                  <AlertTriangle className="w-10 h-10 animate-pulse" />
                </div>
              )}
              {alertConfig.options.icon === 'error' && (
                <div className="w-20 h-20 rounded-full bg-rose-50 border-4 border-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                  <AlertCircle className="w-10 h-10" />
                </div>
              )}
              {alertConfig.options.icon === 'delete' && (
                <div className="w-20 h-20 rounded-full bg-rose-50 border-4 border-rose-100 text-rose-600 flex items-center justify-center shadow-inner">
                  <Trash2 className="w-10 h-10 animate-pulse" />
                </div>
              )}
              {(alertConfig.options.icon === 'question' || !alertConfig.options.icon) && (
                <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                  <HelpCircle className="w-10 h-10" />
                </div>
              )}
              {alertConfig.options.icon === 'info' && (
                <div className="w-20 h-20 rounded-full bg-indigo-50 border-4 border-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  <Info className="w-10 h-10" />
                </div>
              )}
            </div>

            {/* Title & Body */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {alertConfig.options.title}
              </h3>
              {alertConfig.options.text && (
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  {alertConfig.options.text}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {alertConfig.options.showCancelButton && (
                <button
                  type="button"
                  onClick={handleAlertCancel}
                  className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-sm w-1/2"
                >
                  {alertConfig.options.cancelButtonText || 'Cancel'}
                </button>
              )}
              <button
                type="button"
                onClick={handleAlertConfirm}
                className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl transition shadow-md ${
                  alertConfig.options.showCancelButton ? 'w-1/2' : 'w-full'
                } ${
                  alertConfig.options.isDangerous || alertConfig.options.icon === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                    : alertConfig.options.icon === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {alertConfig.options.confirmButtonText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const useNotifications = useNotification;

