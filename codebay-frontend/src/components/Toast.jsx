import { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const bgColor = toast.type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = toast.type === 'success' ? '✓' : '✕';

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-in slide-in-from-right-2 duration-300`}>
      <span className="text-lg">{icon}</span>
      <span>{toast.message}</span>
      <button 
        onClick={onClose} 
        className="text-white hover:text-gray-200 ml-2 text-lg font-bold"
        aria-label="Close toast"
      >
        ×
      </button>
    </div>
  );
}