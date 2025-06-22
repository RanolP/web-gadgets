import { createSignal } from 'solid-js';
import type { Toast, ToastType } from './types';

const [toasts, setToasts] = createSignal<Toast[]>([]);

let toastIdCounter = 0;

export const showToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = 3000
) => {
  const id = `toast-${++toastIdCounter}`;
  const toast: Toast = {
    id,
    message,
    type,
    duration,
  };

  setToasts((prev) => [...prev, toast]);

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

export const removeToast = (id: string) => {
  setToasts((prev) => prev.filter((toast) => toast.id !== id));
};

export const clearAllToasts = () => {
  setToasts([]);
};

export { toasts };