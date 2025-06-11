import mqtt from 'mqtt';

const mqttClient = mqtt.connect('ws://localhost:9002', {
  clientId: 'cocina_' + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

mqttClient.on('connect', () => {
  console.log('📡 Cocina conectada a MQTT');
  mqttClient.subscribe('ordenes/nueva', (err) => {
    if (err) {
      console.error('❌ Error al suscribirse a ordenes/nueva:', err);
    }
  });
});

export { mqttClient };
