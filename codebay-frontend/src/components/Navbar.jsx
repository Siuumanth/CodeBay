import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <img 
      src="../assets/logo.png" 
      alt="Logo" 
      className="w-full h-full object-contain"
    />
          </div>
          <span className="text-xl font-bold text-white">CodeBay</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
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
              
              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user?.username || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}