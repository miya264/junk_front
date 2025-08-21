'use client';

export default function DebugPage() {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Environment Variables:</h2>
        <p><strong>NEXT_PUBLIC_API_ENDPOINT:</strong> {apiEndpoint || 'undefined'}</p>
        <p><strong>Default fallback:</strong> http://127.0.0.1:8000</p>
        
        <div className="mt-4">
          <h3 className="font-semibold">All NEXT_PUBLIC_ variables:</h3>
          <pre className="bg-white p-2 mt-2 rounded text-sm overflow-auto">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(process.env).filter(([key]) => 
                  key.startsWith('NEXT_PUBLIC_')
                )
              ),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}