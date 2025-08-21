import React, { useState } from 'react';
import { api } from '@/utils/api';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionTest: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setLastError(null);
    
    try {
      console.log('Starting connection test...');
      const result = await api.testConnection();
      console.log('Connection test result:', result);
      setIsConnected(result);
      
      if (!result) {
        setLastError('Connection test failed');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setIsConnected(false);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">API接続テスト</h3>
        <button
          onClick={testConnection}
          disabled={isTesting}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isTesting ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          テスト
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-xs">
        {isConnected === null ? (
          <span className="text-gray-500">未テスト</span>
        ) : isConnected ? (
          <>
            <Wifi className="w-3 h-3 text-green-500" />
            <span className="text-green-600">接続OK</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-red-500" />
            <span className="text-red-600">接続エラー</span>
          </>
        )}
      </div>
      
      {lastError && (
        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          {lastError}
        </div>
      )}
      
      <div className="mt-1 text-xs text-gray-500">
        Endpoint: {process.env.NEXT_PUBLIC_API_ENDPOINT}
      </div>
    </div>
  );
};