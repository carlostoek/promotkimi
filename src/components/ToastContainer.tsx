import { CheckCircle, XCircle, Info, Loader2, X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  loading: Loader2,
};

const toastColors = {
  success: 'text-[#10B981]',
  error: 'text-[#EF4444]',
  info: 'text-[#06B6D4]',
  loading: 'text-[#8B5CF6]',
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        const colorClass = toastColors[toast.type];

        return (
          <div
            key={toast.id}
            className="toast"
          >
            <Icon
              className={`w-5 h-5 ${colorClass} ${toast.type === 'loading' ? 'animate-spin' : ''}`}
            />
            <span className="text-white text-sm">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-[#71717A] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
