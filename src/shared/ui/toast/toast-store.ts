import { create } from 'zustand';

export type ToastKind = 'info' | 'error' | 'success';

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  items: ToastItem[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
}

const TOAST_LIFETIME = 4_500;
const MAX_TOASTS = 4;
let nextId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  items: [],
  push: (kind, message) => {
    // Одинаковое сообщение подряд не дублируем (например, серия сетевых ошибок).
    if (get().items.some((t) => t.message === message)) {
      return;
    }
    const id = nextId++;
    set((state) => ({ items: [...state.items, { id, kind, message }].slice(-MAX_TOASTS) }));
    setTimeout(() => get().dismiss(id), TOAST_LIFETIME);
  },
  dismiss: (id) => set((state) => ({ items: state.items.filter((t) => t.id !== id) })),
}));

export const toast = {
  info: (message: string) => useToastStore.getState().push('info', message),
  success: (message: string) => useToastStore.getState().push('success', message),
  error: (message: string) => useToastStore.getState().push('error', message),
};
