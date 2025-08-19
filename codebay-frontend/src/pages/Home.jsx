import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [gitURL, setGitURL] = useState('');
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const validateGitURL = async (url) => {
    try {
      let webURL = url.trim();
  
      // Convert SSH to HTTPS
      if (webURL.startsWith("git@github.com:")) {
        webURL = webURL.replace("git@github.com:", "https://github.com/");
      } else if (webURL.startsWith("git@gitlab.com:")) {
        webURL = webURL.replace("git@gitlab.com:", "https://gitlab.com/");
      }
  
      // Drop trailing .git
      if (webURL.endsWith(".git")) {
        webURL = webURL.slice(0, -4);
      }
  
      // Just check basic URL structure
      const validHost =
        webURL.startsWith("https://github.com/") ||
        webURL.startsWith("https://gitlab.com/");
  
      return validHost;
    } catch (err) {
      return false;
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!gitURL.trim()) {
      setError('Please enter a Git URL');
      return;
    }

    // Basic validation for git URLs
    const isValidGitUrl = gitURL.includes('github.com') || 
                         gitURL.includes('gitlab.com') || 
                         gitURL.includes('.git') ||
                         gitURL.startsWith('git@');

    if (!isValidGitUrl) {
      setError('Please enter a valid Git repository URL');
      return;
    }

    // Validate that the repository is accessible
    const isValidRepo = await validateGitURL(gitURL);
    if (!isValidRepo) {
      setError('Repository not accessible. Please check if the URL is correct or make the repository public.');
      return;
    }

    // Navigate to configure page with git URL
    navigate('/configure', { state: { gitURL } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
      
      
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to CodeBay
        </h1>
        {user ? (
          <p className="text-xl text-gray-400">
            Welcome back, <span className="text-blue-400">{user.username || 'Developer'}</span>! 
            Ready to build something amazing?
          </p>
        ) : (
          <p className="text-xl text-gray-400">
            Build, monitor, and deploy your projects with ease
          </p>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Start New Build
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gitURL" className="block text-sm font-medium text-gray-300 mb-2">
              Git Repository URL
            </label>
            <input
              id="gitURL"
              type="text"
              value={gitURL}
              onChange={(e) => {
                setGitURL(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://github.com/username/repository"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!gitURL.trim() || validating}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
          >
            {validating ? (
              <>
                <span>Validating Repository...</span>
              </>
            ) : (
              <span>Continue to Build Settings</span>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
 <h3 className="font-medium text-blue-300 mb-2">How it works:</h3>
 <ul className="text-blue-200 text-sm space-y-1">
   <li>1. Enter your Git repository URL</li>
   <li>2. Configure build settings, type a custom subdomain</li>
   <li>3. Select a start folder inside your repo</li>
   <li>4. We'll clone and build your project in a secure container</li>
   <li>5. Watch real-time logs as your build progresses</li>
   <li>6. Get your deployed URL when complete</li>
 </ul>
 
 <div className="mt-3 pt-3 border-t border-blue-500/20">
   <p className="text-blue-200 text-sm">
     <strong className="text-blue-300">Note:</strong> You can deploy only React projects for now.
   </p>
 </div>
</div>

      {user && (
        <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium mb-1">Quick Actions</h3>
              <p className="text-gray-400 text-sm">Manage your existing projects</p>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              View History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/*

  <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">🚀</span>
        </div>*/