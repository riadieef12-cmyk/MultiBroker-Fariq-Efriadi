import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mqtt from 'mqtt';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  });
  
  let mqttClient: mqtt.MqttClient | null = null;
  // Generate random strings for stable client ID across disconnects for this instance
  const instanceId = Math.random().toString(16).substring(2, 6);
  
  io.on('connection', (socket) => {
    // Send immediate initial status to newly connected clients
    if (mqttClient && mqttClient.connected) {
      socket.emit('broker_status', 'connected');
    } else {
      socket.emit('broker_status', 'disconnected');
    }

    socket.on('connect_broker', (config) => {
      if (mqttClient) {
        mqttClient.end();
      }
      
      const { server, port, clientId, username, password } = config;
      // Depending on the port, select mqtt or mqtts
      const protocol = port === 8883 ? 'mqtts' : 'mqtt';
      const brokerUrl = `${protocol}://${server}:${port}`;
      
      socket.emit('log', { message: `Menghubungkan ke broker ${server}...`, type: 'info' });
      socket.emit('broker_status', 'connecting');
      
      try {
        mqttClient = mqtt.connect(brokerUrl, {
          clientId,
          username,
          password,
          rejectUnauthorized: false
        });
        
        mqttClient.on('connect', () => {
          socket.emit('broker_status', 'connected');
          socket.emit('log', { message: 'Berhasil terhubung ke broker.', type: 'success' });
          
          if (mqttClient) {
            mqttClient.subscribe('cecep/relay/status');
            mqttClient.subscribe('cecep/sensor/suhu');
            mqttClient.subscribe('cecep/sensor/kelembapan');
          }
        });

        mqttClient.on('message', (topic, message) => {
          socket.emit('mqtt_message', { topic, message: message.toString() });
        });
        
        mqttClient.on('error', (err) => {
          socket.emit('broker_status', 'error');
          socket.emit('log', { message: `Gagal terhubung: ${err.message}`, type: 'error' });
        });
        
        mqttClient.on('close', () => {
          socket.emit('broker_status', 'disconnected');
        });
        
        mqttClient.on('disconnect', () => {
          socket.emit('log', { message: 'Terputus dari broker.', type: 'warning' });
        });
      } catch (err: any) {
        socket.emit('broker_status', 'error');
        socket.emit('log', { message: `Gagal inisialisasi MQTT: ${err.message}`, type: 'error' });
      }
    });
    
    socket.on('disconnect_broker', () => {
      if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
        socket.emit('log', { message: 'Berhasil memutuskan koneksi dari broker.', type: 'warning' });
        socket.emit('broker_status', 'disconnected');
      }
    });
    
    socket.on('toggle_relay', ({ relayId, state }) => {
      if (mqttClient && mqttClient.connected) {
        const topic = `cecep/relay/${relayId}`;
        const message = state ? 'ON' : 'OFF';
        mqttClient.publish(topic, message);
        socket.emit('log', { message: `Kirim kontrol ${relayId} menjadi ${message}`, type: 'action' });
      } else {
        socket.emit('log', { message: `Gagal mengatur Relay ${relayId}: Tidak terhubung ke broker`, type: 'error' });
      }
    });

    socket.on('toggle_all', ({ state }) => {
      if (mqttClient && mqttClient.connected) {
        const message = state ? 'ON' : 'OFF';
        mqttClient.publish('cecep/relay/all', message);
        socket.emit('log', { message: `Kirim kontrol Semua Lampu menjadi ${message}`, type: 'action' });
      } else {
        socket.emit('log', { message: `Gagal mengatur Semua Lampu: Tidak terhubung ke broker`, type: 'error' });
      }
    });

    socket.on('switch_esp_broker', ({ brokerId }) => {
      if (mqttClient && mqttClient.connected) {
        mqttClient.publish('cecep/broker/switch', brokerId.toString());
        socket.emit('log', { message: `Kirim perintah pindah broker ke ESP32: Broker ${brokerId}`, type: 'action' });
      }
    });

    socket.on('send_combo', ({ comboCmd }) => {
      if (mqttClient && mqttClient.connected) {
        mqttClient.publish('cecep/relay/combo', comboCmd);
        socket.emit('log', { message: `Kirim kombinasi: ${comboCmd}`, type: 'action' });
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
