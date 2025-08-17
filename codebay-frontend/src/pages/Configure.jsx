import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { startDeploy } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CopyButton from '../components/CopyButton';

export default function Configure() {
  const location = useLocation();
  const navigate = useNavigate();
  const { gitURL } = location.state || {};
  
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if no gitURL
  if (!gitURL) {
    navigate('/');
    return null;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const deployData = {
        gitURL,
        projectSlug: customSlug.trim() || undefined,
      };
  
      const response = await startDeploy(deployData);
  
      alert('Build started successfully!');
  
      navigate(`/build/${response.projectSlug}`, { 
        state: { 
          gitURL, 
          startTime: Date.now(),
          deploymentId: response.deploymentId
        }
      });
    } catch (err) {
      // Prioritize backend error message
      const errorMessage = err.data?.error || 'Failed to start build. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/')}
          className="text-blue-400 hover:text-blue-300 mb-4 transition-colors"
        >
          ← Back to Home
        </button>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          Configure Build
        </h1>
        <p className="text-gray-400">Set up your build settings</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Repository</h3>
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-3">
            <span className="text-gray-300 font-mono text-sm flex-1 break-all">{gitURL}</span>
            <CopyButton text={gitURL} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Project Settings</h3>
            <p className="text-gray-400 text-sm mb-4">
              Choose a custom domain name for your project (optional). If left empty, we'll generate one automatically.
            </p>
            
            <div>
              <label htmlFor="customSlug" className="block text-sm font-medium text-gray-300 mb-2">
                Custom Domain Name
              </label>
              <input
                id="customSlug"
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-awesome-project (optional)"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-gray-500 text-sm mt-1">
                Only lowercase letters and hyphens allowed. Your site will be available at: 
                <span className="font-mono text-blue-400 ml-1">
                  {customSlug ? `https://${customSlug}.codebay.sbs` : 'https://[auto-generated].codebay.sbs'}
                </span>
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
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
          </div>
        </form>
      </div>
    </div>
  );
}