export default function LogMessage({ message }) {
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex items-start space-x-3 py-1 px-3 hover:bg-gray-800 rounded">
      <span className="text-gray-400 text-xs font-mono flex-shrink-0 mt-0.5">
        {formatTime(message.timestamp)}
      </span>
      <span className="text-gray-100 text-sm font-mono break-all">
        {typeof message.content === 'string' ? message.content : message.content.log || JSON.stringify(message.content)}
      </span>
    </div>
  );
}