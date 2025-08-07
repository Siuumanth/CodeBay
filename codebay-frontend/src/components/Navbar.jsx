import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CB</span>
          </div>
          <span className="text-xl font-bold text-gray-900">CodeBay</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Home
          </Link>
          <button 
            className="text-gray-400 cursor-not-allowed font-medium"
            disabled
          >
            History
          </button>
        </div>
      </div>
    </nav>
  );
}