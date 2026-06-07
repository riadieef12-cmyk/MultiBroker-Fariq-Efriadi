import React from 'react';
import { LogEntry } from '../types';

export function LogViewer({ logs }: { logs: LogEntry[] }) {
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'info': return 'text-blue-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      case 'action': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-[#2c3629] rounded-xl shadow-lg border border-[#404e3b] overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[#404e3b] bg-[#364232]">
        <h2 className="text-lg font-semibold text-white">Log Aktifitas</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Belum ada aktifitas...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex space-x-3">
              <span className="text-gray-500 whitespace-nowrap">
                {log.timestamp.toLocaleTimeString('id-ID', { hour12: false })}
              </span>
              <span className={`${getLogColor(log.type)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
