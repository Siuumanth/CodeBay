import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import LogMessage from '../components/LogMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import CopyButton from '../components/CopyButton';
import BuildTimer from '../components/BuildTimer';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function BuildDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const { gitURL, startTime } = location.state || {};
  const { toast, showToast } = useToast();
  const { messages, connected } = useSocket(`logs:${slug}`);
  const [buildStatus, setBuildStatus] = useState('running');
  const [buildStartTime] = useState(startTime || Date.now());
  const logsEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if build is complete based on log messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    let logContent = '';
    
    if (lastMessage) {
      if (typeof lastMessage.content === 'string') {
        logContent = lastMessage.content;
      } else if (lastMessage.content.log) {
        logContent = lastMessage.content.log;
      } else if (lastMessage.content.logs) {
        logContent = lastMessage.content.logs;
      }
    }

    if (logContent.toLowerCase().includes('done') || logContent.toLowerCase().includes('build complete')) {
      setBuildStatus('completed');
      showToast('Build completed successfully!', 'success');
      
      // Store completion in localStorage
      const completedBuilds = JSON.parse(localStorage.getItem('completedBuilds') || '{}');
      completedBuilds[`logs:${slug}`] = true;
      localStorage.setItem('completedBuilds', JSON.stringify(completedBuilds));
    } else if (logContent.toLowerCase().includes('error') || 
               logContent.toLowerCase().includes('failed') ||
               logContent.toLowerCase().includes('build failed')) {
      setBuildStatus('failed');
      showToast('Build failed. Check logs for details.', 'error');
    }
  }, [messages, slug, showToast]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/50 border-green-500/50';
      case 'failed': return 'text-red-400 bg-red-900/50 border-red-500/50';
      default: return 'text-blue-400 bg-blue-900/50 border-blue-500/50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Build Completed';
      case 'failed': return 'Build Failed';
      default: return 'Build Running';
    }
  };

  // Use the correct domain from the backend
  const hostedURL = `https://${slug}.codebay.xyz`;

  const getAllLogsText = () => {
    return messages.map(m => {
      if (typeof m.content === 'string') return m.content;
      return m.content.log || m.content.logs || JSON.stringify(m.content);
    }).join('\n');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Toast toast={toast} onClose={() => {}} />
      
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
        >
          ← Back to Home
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Build Details
            </h1>
            <div className="space-y-1">
              <p className="text-gray-400">Project ID: <span className="font-mono">{slug}</span></p>
              {gitURL && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Repository:</span>
                  <span className="text-gray-300 font-mono text-sm break-all">{gitURL}</span>
                  <CopyButton text={gitURL} />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <BuildTimer startTime={buildStartTime} isRunning={buildStatus === 'running'} />
            
            <div className={`px-3 py-1 rounded-full border font-medium ${getStatusColor(buildStatus)} flex items-center space-x-2`}>
              {buildStatus === 'running' && <LoadingSpinner size="sm" />}
              <span>{getStatusText(buildStatus)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hosted URL Preview */}
      <div className="mb-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-medium">Hosted URL</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-gray-300 font-mono">{hostedURL}</span>
              <CopyButton text={hostedURL} />
            </div>
            {buildStatus !== 'completed' && (
              <p className="text-gray-500 text-sm mt-1">Available after build completion</p>
            )}
          </div>
          {buildStatus === 'completed' && (
            <a 
              href={hostedURL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Visit Site →
            </a>
          )}
        </div>
      </div>

      {/* Build Logs */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-white font-medium flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            Live Build Logs
          </h2>
          {messages.length > 0 && (
            <CopyButton text={getAllLogsText()} />
          )}
        </div>
        
        <div className="h-96 overflow-y-auto p-4 font-mono text-sm">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-400 mt-4">
                  {connected ? 'Waiting for build to start...' : 'Connecting to build logs...'}
                </p>
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

      {/* Success Message */}
      {buildStatus === 'completed' && (
        <div className="mt-6 bg-green-900/50 border border-green-500/50 rounded-lg p-4">
          <h3 className="font-medium text-green-300 mb-2">🎉 Build Successful!</h3>
          <p className="text-green-200 text-sm mb-3">
            Your project has been built and deployed successfully.
          </p>
          <a 
            href={hostedURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            View Deployed Site →
          </a>
        </div>
      )}

      {/* Failure Message */}
      {buildStatus === 'failed' && (
        <div className="mt-6 bg-red-900/50 border border-red-500/50 rounded-lg p-4">
          <h3 className="font-medium text-red-300 mb-2">❌ Build Failed</h3>
          <p className="text-red-200 text-sm mb-3">
            There was an error during the build process. Check the logs above for details.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
          >
            Start New Build
          </Link>
        </div>
      )}
    </div>
  );
}