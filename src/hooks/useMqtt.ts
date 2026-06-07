import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { BrokerStatus, LogEntry, BrokerConfig, RelayState, SensorData } from '../types';

export function useMqtt() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<BrokerStatus>('disconnected');
  const [connectedServer, setConnectedServer] = useState<string>('node02.myqtthub.com');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [relayStates, setRelayStates] = useState<RelayState>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const [sensorData, setSensorData] = useState<SensorData>({
    suhu: null,
    kelembapan: null,
  });

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('broker_status', (newStatus: BrokerStatus) => {
      setStatus(newStatus);
    });

    newSocket.on('mqtt_message', (data: { topic: string; message: string }) => {
      if (data.topic === 'cecep/relay/status') {
        try {
          const statusObj = JSON.parse(data.message);
          setRelayStates(prev => ({
            ...prev,
            1: statusObj.relay1 === 'ON',
            2: statusObj.relay2 === 'ON',
            3: statusObj.relay3 === 'ON',
            4: statusObj.relay4 === 'ON',
          }));
        } catch(e) {
          console.error("Failed to parse MQTT message:", e);
        }
      } else if (data.topic === 'cecep/sensor/suhu') {
        setSensorData(prev => ({ ...prev, suhu: parseFloat(data.message) }));
      } else if (data.topic === 'cecep/sensor/kelembapan') {
        setSensorData(prev => ({ ...prev, kelembapan: parseFloat(data.message) }));
      }
    });

    newSocket.on('log', (data: { message: string; type: LogEntry['type'] }) => {
      setLogs((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          message: data.message,
          type: data.type,
        },
        ...prev,
      ].slice(0, 100)); // Keep last 100 logs
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addLocalLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date(),
        message,
        type,
      },
      ...prev,
    ].slice(0, 100));
  }, []);

  const connect = useCallback((config: BrokerConfig) => {
    if (socket) {
      setConnectedServer(config.server);
      socket.emit('connect_broker', config);
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.emit('disconnect_broker');
    }
  }, [socket]);

  const toggleRelay = useCallback((relayId: 1 | 2 | 3 | 4) => {
    setRelayStates((prev) => {
      const newState = !prev[relayId as keyof RelayState];
      if (socket) {
        socket.emit('toggle_relay', { relayId, state: newState });
      }
      return { ...prev, [relayId]: newState };
    });
  }, [socket]);

  const toggleRelayCommand = useCallback((id: 1 | 2 | 3 | 4, state: boolean) => {
    setRelayStates((prev) => {
      // only emit if state changes to avoid unnecessary MQTT spam
      if (prev[id as keyof RelayState] !== state) {
        if (socket) {
          socket.emit('toggle_relay', { relayId: id, state: state });
        }
        return { ...prev, [id]: state };
      }
      return prev;
    });
  }, [socket]);

  const sendCombo = useCallback((comboCmd: string) => {
    if (socket) {
      socket.emit('send_combo', { comboCmd });
      addLocalLog(`Mengirim kombinasi: ${comboCmd}`, 'info');
    }
  }, [socket, addLocalLog]);

  // Voice command handling
  const handleVoiceCommand = useCallback((command: string) => {
    const lowerCmd = command.toLowerCase();
    
    // Pattern matching logic
    const isTurnOn = /hidupkan|nyalakan|on|aktifkan|buka/.test(lowerCmd);
    const isTurnOff = /matikan|padamkan|off|nonaktifkan|tutup/.test(lowerCmd);
    
    let handled = false;
    let responseText = '';
    
    if (/suhu/.test(lowerCmd) && /kelembaban|kelembapan/.test(lowerCmd)) {
      handled = true;
      responseText = `Suhu saat ini adalah ${sensorData.suhu !== null ? sensorData.suhu : 'belum tersedia'} derajat celcius, dan kelembaban ${sensorData.kelembapan !== null ? sensorData.kelembapan : 'belum tersedia'} persen`;
      addLocalLog(`Voice Info: Suhu ${sensorData.suhu !== null ? `${sensorData.suhu}°C` : '--'}, Kelembaban ${sensorData.kelembapan !== null ? `${sensorData.kelembapan}%` : '--'}`, 'info');
    } else if (/suhu|temperatur/.test(lowerCmd)) {
      handled = true;
      responseText = sensorData.suhu !== null ? `Suhu ruangan saat ini adalah ${sensorData.suhu} derajat celcius` : 'Data suhu belum tersedia';
      addLocalLog(`Voice Info Suhu: ${sensorData.suhu !== null ? `${sensorData.suhu}°C` : '--'}`, 'info');
    } else if (/kelembapan|kelembaban|lembab/.test(lowerCmd)) {
      handled = true;
      responseText = sensorData.kelembapan !== null ? `Kelembaban ruangan saat ini adalah ${sensorData.kelembapan} persen` : 'Data kelembaban belum tersedia';
      addLocalLog(`Voice Info Kelembaban: ${sensorData.kelembapan !== null ? `${sensorData.kelembapan}%` : '--'}`, 'info');
    } else if (/semua/.test(lowerCmd) || /semuanya/.test(lowerCmd) || /seluruh/.test(lowerCmd)) {
      if (isTurnOn) { 
        [1, 2, 3, 4].forEach(id => toggleRelayCommand(id as any, true)); 
        handled = true; 
        responseText = 'Semua lampu berhasil dinyalakan';
      }
      else if (isTurnOff) { 
        [1, 2, 3, 4].forEach(id => toggleRelayCommand(id as any, false)); 
        handled = true; 
        responseText = 'Semua lampu berhasil dimatikan';
      }
    } else if (/satu|1|pertama/.test(lowerCmd)) {
      if (/kombinasi|efek/.test(lowerCmd)) {
        handled = true; sendCombo('KIRI_KANAN'); responseText = 'Menjalankan kombinasi satu';
      } else {
        if (isTurnOn) { toggleRelayCommand(1, true); handled = true; responseText = 'Lampu satu dinyalakan'; }
        else if (isTurnOff) { toggleRelayCommand(1, false); handled = true; responseText = 'Lampu satu dimatikan'; }
      }
    } else if (/dua|2|kedua/.test(lowerCmd)) {
      if (/kombinasi|efek/.test(lowerCmd)) {
        handled = true; sendCombo('STROBO'); responseText = 'Menjalankan kombinasi dua';
      } else {
        if (isTurnOn) { toggleRelayCommand(2, true); handled = true; responseText = 'Lampu dua dinyalakan'; }
        else if (isTurnOff) { toggleRelayCommand(2, false); handled = true; responseText = 'Lampu dua dimatikan'; }
      }
    } else if (/tiga|3|ketiga/.test(lowerCmd)) {
     if (/kombinasi|efek/.test(lowerCmd)) {
        handled = true; sendCombo('TENGAH_PINGGIR'); responseText = 'Menjalankan kombinasi tiga';
      } else {
        if (isTurnOn) { toggleRelayCommand(3, true); handled = true; responseText = 'Lampu tiga dinyalakan'; }
        else if (isTurnOff) { toggleRelayCommand(3, false); handled = true; responseText = 'Lampu tiga dimatikan'; }
      }
    } else if (/empat|4|keempat/.test(lowerCmd)) {
      if (/kombinasi|efek/.test(lowerCmd)) {
        handled = true; sendCombo('PINGGIR_TENGAH'); responseText = 'Menjalankan kombinasi empat';
      } else {
        if (isTurnOn) { toggleRelayCommand(4, true); handled = true; responseText = 'Lampu empat dinyalakan'; }
        else if (isTurnOff) { toggleRelayCommand(4, false); handled = true; responseText = 'Lampu empat dimatikan'; }
      }
    } else if (/strobo/.test(lowerCmd)) {
      handled = true; sendCombo('STROBO'); responseText = 'Menjalankan efek strobo';
    }

    const speak = (text: string) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        window.speechSynthesis.speak(utterance);
      }
    };

    if (!handled) {
      addLocalLog(`Perintah suara tidak dikenali: "${command}"`, 'warning');
      speak('Pilihan tidak dikenali, silakan ulangi perintah');
    } else {
      addLocalLog(`Perintah suara berhasil: "${command}"`, 'success');
      speak(responseText);
    }
  }, [socket, addLocalLog, toggleRelayCommand, sensorData, sendCombo]);

  const toggleAll = useCallback((state: boolean) => {
    if (socket) {
      socket.emit('toggle_all', { state });
    }
  }, [socket]);

  const switchEspBroker = useCallback((brokerId: number) => {
    if (socket) {
      socket.emit('switch_esp_broker', { brokerId });
    }
  }, [socket]);

  return {
    status,
    connectedServer,
    logs,
    relayStates,
    sensorData,
    connect,
    disconnect,
    toggleRelay,
    toggleAll,
    switchEspBroker,
    handleVoiceCommand,
    addLocalLog,
    sendCombo
  };
}
