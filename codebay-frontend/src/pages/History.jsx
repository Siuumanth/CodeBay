import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDeployments, getProjects } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CopyButton from '../components/CopyButton';

export default function History() {
  const [deployments, setDeployments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deploymentsData, projectsData] = await Promise.all([
          getDeployments(),
          getProjects()
        ]);
        
        setDeployments(deploymentsData);
        setProjects(projectsData);
      } catch (err) {
        setError(err.message || 'Failed to fetch build history');
        alert('Failed to load build history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'ready':
      case 'completed':
        return 'bg-green-900/50 text-green-300 border-green-500/50';
      case 'fail':
      case 'failed':
        return 'bg-red-900/50 text-red-300 border-red-500/50';
      case 'queued':
      case 'running':
        return 'bg-blue-900/50 text-blue-300 border-blue-500/50';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-500/50';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'ready':
        return 'Completed';
      case 'fail':
        return 'Failed';
      case 'queued':
        return 'Queued';
      case 'running':
        return 'Running';
      default:
        return status || 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProjectByDeployment = (deploymentId) => {
    return projects.find(project => 
      project.id === deploymentId || project.slug === deploymentId
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Build History</h1>
          <p className="text-gray-400">View your past and current builds</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Build History</h1>
          <p className="text-gray-400">View your past and current builds</p>
        </div>
        
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Error Loading History</h2>
            <p className="text-red-200">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (deployments.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Build History</h1>
          <p className="text-gray-400">View your past and current builds</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No builds yet</h2>
          <p className="text-gray-400 mb-6">
            Start your first build to see it appear here in your build history.
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Start Your First Build
          </Link>
        </div>
      </div>
    );
  }

  console.log(deployments)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Build History</h1>
        <p className="text-gray-400">
          {deployments.length} build{deployments.length !== 1 ? 's' : ''} in your history
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deployments.map((deployment) => {  // responsible for looping over deployments 
          const project = getProjectByDeployment(deployment.projectId);
          const hostedURL = `https://${project?.slug || 'unknown'}.codebay.xyz`;
          
          return (
            <div 
              key={deployment.id} 
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => navigate(`/history/${deployment.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(deployment.status)}`}>
                  {getStatusText(deployment.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {project && (
                  <div>
                    <p className="text-white font-medium text-sm">Project: {project.slug}</p>
                    <p className="text-gray-400 text-xs font-mono break-all">{deployment.projectid}</p>
                  </div>
                )}
                
                <p className="text-gray-400 text-xs">
                  Created: {formatDate(deployment.createdat)}
                </p>
               
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">URL:</span>
                  <span className="text-gray-300 text-xs font-mono">{hostedURL}</span>
                  <CopyButton text={hostedURL} />
                </div>
                
                {deployment.status === 'ready' && (
                  <a
                    href={hostedURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Visit →
                  </a>
                )}
                
                <span className="text-blue-400 text-xs">Click to view details →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}