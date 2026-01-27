import { useEffect } from 'react';

export function useDashboardToast(message: string, show: boolean, duration = 4000) {
  useEffect(() => {
    if (!show) return;
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'fixed z-[9999] right-6 bottom-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-base font-semibold animate-fade-in-out';
    toast.style.pointerEvents = 'none';
    document.body.appendChild(toast);
    const timeout = setTimeout(() => {
      toast.classList.add('opacity-0');
      setTimeout(() => toast.remove(), 500);
    }, duration);
    return () => {
      clearTimeout(timeout);
      toast.remove();
    };
  }, [show, message, duration]);
}
