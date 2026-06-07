/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useMqtt } from './hooks/useMqtt';
import { Navbar } from './components/Navbar';
import { RelayCard } from './components/RelayCard';
import { VoiceController } from './components/VoiceController';
import { LogViewer } from './components/LogViewer';
import { motion } from 'motion/react';
import { Thermometer, Droplets } from 'lucide-react';

export default function App() {
  const { 
    status,
    connectedServer,
    logs, 
    relayStates,
    sensorData,
    connect, 
    disconnect, 
    toggleRelay, 
    handleVoiceCommand,
    addLocalLog,
    sendCombo,
    toggleAll,
    switchEspBroker
  } = useMqtt();

  const [buttonStyle, setButtonStyle] = useState<'solid' | 'outline'>('solid');

  return (
    <div className="min-h-screen bg-[#1e251c] text-slate-200 font-sans selection:bg-green-500/30">
      <Navbar 
        status={status}
        connectedServer={connectedServer}
        onConnect={connect} 
        onDisconnect={disconnect} 
        onSwitchEspBroker={switchEspBroker}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Controls */}
          <div className="w-full lg:w-2/3 space-y-8">
            
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Ruang Kendali</h2>
                <p className="text-gray-400 mt-1">Kontrol 4 Relay Lampu Cerdas & Monitoring Sensor</p>
              </div>
              <div className="flex space-x-2 bg-[#2c3629] p-1.5 rounded-lg border border-[#404e3b]">
                <button
                  onClick={() => setButtonStyle('solid')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${buttonStyle === 'solid' ? 'bg-[#404e3b] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  Solid
                </button>
                <button
                  onClick={() => setButtonStyle('outline')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${buttonStyle === 'outline' ? 'bg-[#404e3b] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                  Outline
                </button>
              </div>
            </div>

            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-[#2c3629] p-6 rounded-xl shadow-lg border border-[#404e3b] flex items-center space-x-4">
                <div className="bg-red-500/20 p-4 rounded-full">
                  <Thermometer className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Suhu (DHT11)</p>
                  <p className="text-3xl font-bold text-white">
                    {sensorData.suhu !== null ? `${sensorData.suhu.toFixed(1)}°C` : '--°C'}
                  </p>
                </div>
              </div>
              <div className="bg-[#2c3629] p-6 rounded-xl shadow-lg border border-[#404e3b] flex items-center space-x-4">
                <div className="bg-blue-500/20 p-4 rounded-full">
                  <Droplets className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Kelembaban (DHT11)</p>
                  <p className="text-3xl font-bold text-white">
                    {sensorData.kelembapan !== null ? `${sensorData.kelembapan.toFixed(1)}%` : '--%'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {[1, 2, 3, 4].map((id) => (
                <RelayCard
                  key={id}
                  id={id as 1 | 2 | 3 | 4}
                  isOn={relayStates[id as 1 | 2 | 3 | 4]}
                  onToggle={toggleRelay}
                  styleVariant={buttonStyle}
                />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#2c3629] p-6 rounded-xl shadow-lg border border-[#404e3b] space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Kontrol Tambahan</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => toggleAll(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-lg font-medium shadow-lg shadow-green-600/20 transition-colors"
                  >Nyalakan Semua Lampu</button>
                  <button
                    onClick={() => toggleAll(false)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 px-4 py-3 rounded-lg font-medium transition-colors"
                  >Matikan Semua Lampu</button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Kombinasi Efek Lampu</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => sendCombo('KIRI_KANAN')}
                    className="bg-[#404e3b] hover:bg-[#4d5e47] text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  >Kombinasi 1</button>
                  <button
                    onClick={() => sendCombo('STROBO')}
                    className="bg-[#404e3b] hover:bg-[#4d5e47] text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  >Kombinasi 2</button>
                  <button
                    onClick={() => sendCombo('TENGAH_PINGGIR')}
                    className="bg-[#404e3b] hover:bg-[#4d5e47] text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  >Kombinasi 3</button>
                  <button
                    onClick={() => sendCombo('PINGGIR_TENGAH')}
                    className="bg-[#404e3b] hover:bg-[#4d5e47] text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                  >Kombinasi 4</button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <VoiceController onCommand={handleVoiceCommand} addLog={addLocalLog} />
            </motion.div>

          </div>

          {/* Right Column - Logs */}
          <motion.div 
            className="w-full lg:w-1/3 h-[600px] lg:h-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <LogViewer logs={logs} />
          </motion.div>

        </div>

      </main>
    </div>
  );
}
