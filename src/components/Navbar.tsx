import React, { useState } from 'react';
import { BrokerStatus } from '../types';
import { Activity, Wifi, WifiOff, Loader2, Settings, Eye, EyeOff } from 'lucide-react';

interface NavbarProps {
  status: BrokerStatus;
  connectedServer?: string;
  onConnect: (config: any) => void;
  onDisconnect: () => void;
  onSwitchEspBroker?: (brokerId: number) => void;
}

export function Navbar({ status, connectedServer, onConnect, onDisconnect, onSwitchEspBroker }: NavbarProps) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  
  const [showConfig, setShowConfig] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Config State
  const [server, setServer] = useState('node02.myqtthub.com');
  const [port, setPort] = useState('8883');
  const [clientId, setClientId] = useState('web_client');
  const [username, setUsername] = useState('web123');
  const [password, setPassword] = useState('123');

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <span className="flex items-center text-sm font-medium text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full"><Wifi className="w-4 h-4 mr-2" /> Terhubung</span>;
      case 'connecting':
        return <span className="flex items-center text-sm font-medium text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghubungkan</span>;
      case 'error':
        return <span className="flex items-center text-sm font-medium text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full"><WifiOff className="w-4 h-4 mr-2" /> Gagal</span>;
      default:
        return <span className="flex items-center text-sm font-medium text-gray-400 bg-gray-400/10 px-3 py-1.5 rounded-full"><WifiOff className="w-4 h-4 mr-2" /> Terputus</span>;
    }
  };

  return (
    <>
      <nav className="bg-[#2c3629]/80 backdrop-blur-md border-b border-[#404e3b] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex flex-row items-center space-x-3">
              <div className="bg-[#404e3b] p-2 rounded-lg">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">SmartHome Control</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                {getStatusBadge()}
              </div>
              
              <button
                onClick={() => setShowConfig(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#404e3b] rounded-lg transition-colors"
                title="Pengaturan Broker"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline-block">{
                  isConnected && connectedServer ? (
                    connectedServer.includes('myqtthub') ? 'MyQttHub' :
                    connectedServer.includes('flespi') ? 'Flespi.io' :
                    connectedServer.includes('ably') ? 'Ably.io' : 'Custom Broker'
                  ) : (
                    server.includes('myqtthub') ? 'MyQttHub' :
                    server.includes('flespi') ? 'Flespi.io' :
                    server.includes('ably') ? 'Ably.io' : 'Custom Broker'
                  )
                }</span>
              </button>

              {isConnected ? (
                <button
                  onClick={onDisconnect}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 px-4 py-2 rounded-lg font-medium text-sm transition-all"
                >
                  Putuskan
                </button>
              ) : (
                <button
                  onClick={() => setShowConfig(true)}
                  disabled={isConnecting}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
                >
                  Hubungkan
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Config Modal */}
      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#2c3629] border border-[#404e3b] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Pengaturan Broker MQTT</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Pilih Broker</label>
                <select 
                  value={
                    server.includes('myqtthub') ? 'myqtthub' :
                    server.includes('flespi') ? 'flespi' :
                    server.includes('ably') ? 'ably' : 'myqtthub'
                  }
                  onChange={(e) => {
                    if (e.target.value === 'flespi') {
                      setServer('mqtt.flespi.io');
                      setPort('8883');
                      setClientId('web_client_flespi');
                      setUsername('PX1svsV5lJ2xC0mPsc3H6ESITLMSREgleMTq2TT318bJILEio9xbT2jMdPeaIZwY');
                      setPassword('');
                    } else if (e.target.value === 'myqtthub') {
                      setServer('node02.myqtthub.com');
                      setPort('8883');
                      setClientId('web_client');
                      setUsername('web123');
                      setPassword('123');
                    } else if (e.target.value === 'ably') {
                      setServer('mqtt.ably.io');
                      setPort('8883');
                      setClientId('web_client_ably');
                      setUsername('gxlTJA.8XmDcA');
                      setPassword('X7cxJMvTy6-1Bf5lTKAssFDqC6OcjYMMIns7axK_hvY');
                    }
                  }}
                  className="w-full bg-[#1e251c] border border-[#404e3b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="myqtthub">MyQttHub</option>
                  <option value="flespi">Flespi.io</option>
                  <option value="ably">Ably.io</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Server</label>
                <input 
                  type="text" 
                  value={server} 
                  onChange={(e) => setServer(e.target.value)}
                  className="w-full bg-[#1e251c] text-white border border-[#404e3b] rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" 
                />
              </div>
              
              <div className="flex space-x-4">
                 <div className="w-1/3">
                   <label className="block text-sm font-medium text-gray-400 mb-1">Port</label>
                   <input 
                     type="number" 
                     value={port} 
                     onChange={(e) => setPort(e.target.value)}
                     className="w-full bg-[#1e251c] text-white border border-[#404e3b] rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" 
                   />
                 </div>
                 <div className="w-2/3">
                   <label className="block text-sm font-medium text-gray-400 mb-1">Client ID</label>
                   <input 
                     type="text" 
                     value={clientId} 
                     onChange={(e) => setClientId(e.target.value)}
                     className="w-full bg-[#1e251c] text-white border border-[#404e3b] rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" 
                   />
                 </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-1/2">
                   <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                   <input 
                     type="text" 
                     value={username} 
                     onChange={(e) => setUsername(e.target.value)}
                     className="w-full bg-[#1e251c] text-white border border-[#404e3b] rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors" 
                   />
                </div>
                <div className="w-1/2">
                   <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                   <div className="relative">
                     <input 
                       type={showPassword ? "text" : "password"} 
                       value={password} 
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full bg-[#1e251c] text-white border border-[#404e3b] rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:border-green-500 transition-colors" 
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                     >
                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                     </button>
                   </div>
                </div>
              </div>

            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfig(false)}
                className="px-5 py-2.5 text-gray-300 hover:bg-[#404e3b] rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  let brokerId = 1;
                  if (server.includes('flespi')) brokerId = 2;
                  if (server.includes('ably')) brokerId = 3;

                  // Tell ESP32 to switch broker first (if already connected to current broker)
                  if (onSwitchEspBroker) {
                    onSwitchEspBroker(brokerId);
                  }

                  // Wait briefly before reconnecting web to give time for message to be sent
                  setTimeout(() => {
                    onConnect({
                      server: server,
                      port: parseInt(port, 10),
                      clientId: clientId,
                      username: username,
                      password: password
                    });
                  }, 500);

                  setShowConfig(false);
                }}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium shadow-lg shadow-green-600/20 transition-colors"
              >
                {isConnected ? 'Selesai' : 'Simpan & Hubungkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
