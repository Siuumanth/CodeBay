import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const [gitURL, setGitURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!gitURL.trim()) {
      setError('Please enter a Git URL');
      return;
    }

    if (!gitURL.includes('github.com') && !gitURL.includes('gitlab.com') && !gitURL.includes('.git')) {
      setError('Please enter a valid Git repository URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await createProject(gitURL);
      navigate(`/build/${response.data.projectSlug}`);
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to CodeBay
        </h1>
        <p className="text-xl text-gray-600">
          Build, monitor, and deploy your projects with ease
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Start New Build
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gitURL" className="block text-sm font-medium text-gray-700 mb-2">
              Git Repository URL
            </label>
            <input
              id="gitURL"
              type="url"
              value={gitURL}
              onChange={(e) => setGitURL(e.target.value)}
              placeholder="https://github.com/username/repository.git"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !gitURL.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Starting Build...</span>
              </>
            ) : (
              <span>Start Build</span>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>1. Enter your Git repository URL</li>
          <li>2. We'll clone and build your project in a secure container</li>
          <li>3. Watch real-time logs as your build progresses</li>
          <li>4. Get your deployed URL when complete</li>
        </ul>
      </div>
    </div>
  );
}