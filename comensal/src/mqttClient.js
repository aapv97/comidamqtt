import mqtt from 'mqtt';

const topicEscucha = 'ordenes/status/mesa1';
const client = mqtt.connect('ws://localhost:9002', {
  clientId: `comensal_${Math.random().toString(16).substr(2, 8)}`,
  reconnectPeriod: 1000,
  keepalive: 60,
});

let estadoCallback = null;

client.on('connect', () => {
  console.log('📡 MQTT conectado desde FrontComensal');
  client.subscribe(topicEscucha, (err) => {
    if (!err) {
      console.log(`🧏 Suscrito a ${topicEscucha}`);
    } else {
      console.error('❌ Error al suscribirse a estado:', err);
    }
  });
});

client.on('message', (topic, message) => {
  if (topic === topicEscucha && estadoCallback) {
    try {
      const estado = JSON.parse(message.toString());
      console.log("📦 Estado recibido:", estado);
      estadoCallback(estado);
    } catch (e) {
      console.error('❌ Error al parsear mensaje MQTT:', e);
    }
  }
});

export async function enviarPedido(pedido) {
  try {
    const response = await fetch('http://localhost:3001/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productos: pedido.productos }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error al enviar pedido:', data);
      alert('Error al enviar pedido');
      return;
    }

    console.log("✅ Pedido enviado al backend y publicado a cocina:", data);
  } catch (error) {
    console.error('❌ Error de red al enviar pedido:', error);
    alert('Error de red al enviar pedido');
  }
}

export function escucharEstado(callback) {
  estadoCallback = callback;
}
