import toast, { Toaster } from 'react-hot-toast';

export const ToastContainer = Toaster;

export const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    background: '#fff',
    color: '#0f172a',
    borderRadius: '1.25rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
    fontSize: '0.875rem',
    padding: '1rem 1.5rem',
    border: '1px solid #f1f5f9',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  },
  error: {
    iconTheme: {
      primary: '#f43f5e',
      secondary: '#fff',
    },
  },
};

export const toastService = {
  success: (message: string) => toast.success(message, toastConfig),
  error: (message: string) => toast.error(message, toastConfig),
  loading: (message: string) => toast.loading(message, toastConfig),
  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

// Also export as default 'toast' to match the expected import pattern
export const toast_internal = toastService;
export { toast_internal as toast };
