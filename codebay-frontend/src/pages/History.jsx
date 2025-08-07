export default function History() {
  // Placeholder data for future implementation
  const placeholderBuilds = [
    { id: '1', status: 'completed', repo: 'example/react-app', date: '2024-01-15' },
    { id: '2', status: 'failed', repo: 'example/node-api', date: '2024-01-14' },
    { id: '3', status: 'running', repo: 'example/vue-app', date: '2024-01-13' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Build History</h1>
        <p className="text-gray-400">View your past and current builds</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">History Coming Soon</h2>
          <p className="text-gray-400 mb-6">
            Build history functionality is currently in development. 
            Soon you'll be able to view all your past builds, their status, and logs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {placeholderBuilds.map((build) => (
            <div key={build.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-gray-300">#{build.id}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  build.status === 'completed' ? 'bg-green-900/50 text-green-300' :
                  build.status === 'failed' ? 'bg-red-900/50 text-red-300' :
                  'bg-blue-900/50 text-blue-300'
                }`}>
                  {build.status}
                </span>
              </div>
              <p className="text-white font-medium mb-1">{build.repo}</p>
              <p className="text-gray-400 text-sm">{build.date}</p>
            </div>
          ))}
        </div>

       <p className="text-gray-500 text-sm">
  These are placeholder cards showing what the history page will look like.
</p>
      </div>
    </div>
  );
}