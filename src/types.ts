export type BrokerStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
}

export interface RelayState {
  1: boolean;
  2: boolean;
  3: boolean;
  4: boolean;
}

export interface SensorData {
  suhu: number | null;
  kelembapan: number | null;
}

export interface BrokerConfig {
  server: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
}
