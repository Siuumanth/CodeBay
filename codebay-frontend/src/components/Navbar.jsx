import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CB</span>
          </div>
          <span className="text-xl font-bold text-white">CodeBay</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link 
            to="/" 
            className={`font-medium transition-colors ${
              location.pathname === '/' 
                ? 'text-blue-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/history" 
            className={`font-medium transition-colors ${
              location.pathname === '/history' 
                ? 'text-blue-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            History
          </Link>
        </div>
      </div>
    </nav>
  );
}