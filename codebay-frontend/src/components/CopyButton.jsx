import { useState } from 'react';

export default function CopyButton({ text, size = 'sm' }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const sizeClasses = size === 'sm' ? 'p-1 text-xs' : 'p-2 text-sm';

  return (
    <button
      onClick={copyToClipboard}
      className={`${sizeClasses} bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-colors`}
      title="Copy to clipboard"
    >
      {copied ? '✓' : '📋'}
    </button>
  );
}