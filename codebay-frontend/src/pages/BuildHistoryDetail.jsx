import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDeployment, getProject } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CopyButton from '../components/CopyButton';

export default function BuildHistoryDetail() {
  const { id } = useParams();
  const [deployment, setDeployment] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const deploymentData = await getDeployment(id);
        setDeployment(deploymentData);
        
        if (deploymentData.projectId) {
          try {
            const projectData = await getProject(deploymentData.projectId);
            setProject(projectData);
          } catch (err) {
            console.log('Could not fetch project details');
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch build details');
        alert('Failed to load build details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !deployment) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Error Loading Build Details</h2>
            <p className="text-red-200">{error || 'Build not found'}</p>
          </div>
          <Link
            to="/history"
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const hostedURL = `https://${project?.slug || 'unknown'}.codebay.sbs`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link 
          to="/history" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
        >
          ← Back to History
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Build Details
            </h1>
            <div className="space-y-1">
              <p className="text-gray-400">Build ID: <span className="font-mono">{deployment.id}</span></p>
              {project && (
                <p className="text-gray-400">Project: <span className="font-mono">{project.slug}</span></p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full border font-medium ${getStatusColor(deployment.status)}`}>
              {getStatusText(deployment.status)}
            </span>
            
            <div className="text-sm text-gray-400">
              Created: {formatDate(deployment.createdat)}
            </div>
          </div>
        </div>
      </div>

      {/* Project Information */}
      {project && (
        <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-white font-medium mb-2">Project Information</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Repository:</span>
              <span className="text-gray-300 font-mono text-sm break-all">{project.gitUrl}</span>
              <CopyButton text={project.gitUrl} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Hosted URL:</span>
              <span className="text-gray-300 font-mono text-sm">{hostedURL}</span>
              <CopyButton text={hostedURL} />
            </div>
          </div>
        </div>
      )}

      {/* Build Logs */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-white font-medium">Build Logs</h2>
          {deployment.logs && (
            <CopyButton text={deployment.logs} />
          )}
        </div>
        
        <div className="h-96 overflow-y-auto p-4 font-mono text-sm">
          {deployment.logs ? (
            <div className="whitespace-pre-wrap text-gray-300">
              {deployment.logs}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400">No logs available for this build</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <Link
          to="/history"
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Back to History
        </Link>
        
        {deployment.status === 'ready' && (
          <a
            href={hostedURL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Visit Deployed Site →
          </a>
        )}
      </div>
    </div>
  );
}
