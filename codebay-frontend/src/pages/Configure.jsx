import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { startDeploy } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CopyButton from '../components/CopyButton';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function Configure() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const { gitURL } = location.state || {};
  
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [loading, setLoading] = useState(false);

  // Redirect if no gitURL
  if (!gitURL) {
    navigate('/');
    return null;
  }

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index, field, value) => {
    const updated = envVars.map((env, i) => 
      i === index ? { ...env, [field]: value } : env
    );
    setEnvVars(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty environment variables
      const filteredEnvVars = envVars.filter(env => env.key.trim() && env.value.trim());
      
      const deployData = {
        gitURL,
        envVars: filteredEnvVars
      };

      const response = await startDeploy(deployData);
      showToast('Build started successfully!', 'success');
      
      setTimeout(() => {
        navigate(`/build/${response.projectSlug}`, { 
          state: { gitURL, startTime: Date.now() }
        });
      }, 1000);
    } catch (err) {
      showToast(err.message || 'Failed to start build. Please try again.', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Toast toast={toast} onClose={() => {}} />
      
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
        <p className="text-gray-400">Set up your build environment and variables</p>
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
            <h3 className="text-lg font-semibold text-white mb-4">Environment Variables</h3>
            <p className="text-gray-400 text-sm mb-4">
              Add environment variables that your application needs during build time.
            </p>
            <div className="space-y-3">
              {envVars.map((env, index) => (
                <div key={index} className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Variable name (e.g., NODE_ENV)"
                    value={env.key}
                    onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., production)"
                    value={env.value}
                    onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {envVars.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEnvVar(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Remove variable"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addEnvVar}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              + Add Environment Variable
            </button>
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