'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/services';

export default function DebugPage() {
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    // クライアントサイド情報を取得
    const info = {
      hostname: window.location.hostname,
      origin: window.location.origin,
      isProd: window.location.hostname !== 'localhost' && 
              window.location.hostname !== '127.0.0.1' &&
              !window.location.hostname.includes('localhost'),
      envVariable: process.env.NEXT_PUBLIC_API_ENDPOINT,
      userAgent: navigator.userAgent,
    };
    setClientInfo(info);
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      const isHealthy = await ApiService.isHealthy();
      setTestResult(`✅ Connection successful: ${isHealthy ? 'API is healthy' : 'API responded but unhealthy'}`);
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      
      <div className="space-y-6">
        {/* Build-time Environment Variables */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Build-time Environment Variables:</h2>
          <p><strong>NEXT_PUBLIC_API_ENDPOINT:</strong> {process.env.NEXT_PUBLIC_API_ENDPOINT || 'undefined'}</p>
          <div className="mt-2">
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

        {/* Client-side Runtime Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Client-side Runtime Info:</h2>
          {clientInfo && (
            <div className="space-y-1 text-sm">
              <p><strong>Hostname:</strong> {clientInfo.hostname}</p>
              <p><strong>Origin:</strong> {clientInfo.origin}</p>
              <p><strong>Is Production:</strong> {clientInfo.isProd ? 'Yes' : 'No'}</p>
              <p><strong>Environment Variable:</strong> {clientInfo.envVariable || 'undefined'}</p>
              <p><strong>User Agent:</strong> {clientInfo.userAgent}</p>
            </div>
          )}
        </div>

        {/* Connection Test */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">API Connection Test:</h2>
          <button
            onClick={testConnection}
            disabled={isTestingConnection}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-4"
          >
            {isTestingConnection ? 'Testing...' : 'Test API Connection'}
          </button>
          
          {testResult && (
            <div className="mt-3 p-3 bg-white border rounded">
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
        </div>

        {/* Current API Endpoint */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Current API Configuration:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Active Endpoint:</strong> 
              <span className="font-mono bg-white px-2 py-1 rounded border ml-2">
                {process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://127.0.0.1:8000'}
              </span>
            </p>
            {process.env.NEXT_PUBLIC_API_ENDPOINT && (
              <p><strong>Test Link:</strong> 
                <a href={process.env.NEXT_PUBLIC_API_ENDPOINT} 
                   target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 underline ml-2">
                  Open API Root
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}