import CopyButton from './CopyButton';

// This component renders the log message properly from the object given my useSocket, it formats the time and make it proper
export default function LogMessage({ message }) {
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Extract log content and check for errors
  let logContent = '';
  if (typeof message.content === 'string') {
    logContent = message.content;
  } else if (message.content.log) {
    logContent = message.content.log;
  } else if (message.content.logs) {
    logContent = message.content.logs;
  } else {
    logContent = JSON.stringify(message.content);
  }

  // Check if message contains error indicators
  const isError = /error|failed|fail|exception|fatal/i.test(logContent);

  return (
    <div className="flex items-start space-x-3 py-1 px-3 hover:bg-gray-800 rounded group">
      <span className="text-gray-500 text-xs font-mono flex-shrink-0 mt-0.5">
        {formatTime(message.timestamp)}
      </span>
      <span className={`text-sm font-mono break-all flex-1 ${isError ? 'text-red-400' : 'text-gray-100'}`}>
        {logContent}
      </span>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={logContent} />
      </div>
    </div>
  );
}