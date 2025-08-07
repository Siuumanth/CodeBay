export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const bgColor = toast.type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2`}>
      <span>{toast.message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        
      </button>
    </div>
  );
}