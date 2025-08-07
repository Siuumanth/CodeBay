import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import LogMessage from '../components/LogMessage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BuildDetail() {
  const { slug } = useParams();
  const { messages, connected } = useSocket(`logs:${slug}`);
  const [buildStatus, setBuildStatus] = useState('running');
  const logsEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if build is complete based on log messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.content.includes('Build completed') || 
        lastMessage?.content.includes('Deploy successful')) {
      setBuildStatus('completed');
    } else if (lastMessage?.content.includes('Build failed') || 
               lastMessage?.content.includes('Error')) {
      setBuildStatus('failed');
    }
  }, [messages]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Build Completed';
      case 'failed': return 'Build Failed';
      default: return 'Build Running';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Home
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Build Details
            </h1>
            <p className="text-gray-600">Project ID: {slug}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full border font-medium ${getStatusColor(buildStatus)}`}>
              {buildStatus === 'running' && <LoadingSpinner size="sm" />}
              <span className={buildStatus === 'running' ? 'ml-2' : ''}>
                {getStatusText(buildStatus)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg border overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <h2 className="text-white font-medium flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Live Build Logs
          </h2>
        </div>
        
        <div className="h-96 overflow-y-auto p-4 font-mono text-sm">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-400 mt-4">Waiting for build to start...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <LogMessage key={message.id} message={message} />
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>

      {buildStatus === 'completed' && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">🎉 Build Successful!</h3>
          <p className="text-green-800 text-sm mb-3">
            Your project has been built and deployed successfully.
          </p>
          <a 
            href={`http://${slug}.localhost:8000`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
          >
            View Deployed Site →
          </a>
        </div>
      )}

      {buildStatus === 'failed' && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">❌ Build Failed</h3>
          <p className="text-red-800 text-sm mb-3">
            There was an error during the build process. Check the logs above for details.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            Start New Build
          </Link>
        </div>
      )}
    </div>
  );
}