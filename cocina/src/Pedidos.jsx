import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import TarjetaPedido from './components/TarjetaPedido';

const mqttClient = mqtt.connect('ws://localhost:9002', {
  clientId: `cocina_${Math.random().toString(16).slice(2, 8)}`,
  reconnectPeriod: 1000,
  keepalive: 60
});

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    mqttClient.on('connect', () => {
      console.log('👨‍🍳 Cocina conectada a MQTT');
      mqttClient.subscribe('nuevo/pedido', (err) => {
        if (!err) {
          console.log('📥 Suscrita a nuevo/pedido');
        }
      });
    });

    mqttClient.on('message', (topic, message) => {
        if (topic === 'nuevo/pedido') {
            const pedido = JSON.parse(message.toString());
          
            const estadoInicial = pedido.estado || 'Recibido'; // solo si no viene definido
            const pedidoConEstado = { ...pedido, estado: estadoInicial };
          
            console.log('🆕 Pedido recibido:', pedidoConEstado);
            setPedidos(prev => [...prev, pedidoConEstado]);
          }          
      });      
  }, []);

  return (
    <div style={{
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      background: '#111827',
      minHeight: '100vh',
      color: '#F9FAFB'
    }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px' }}>👨‍🍳 Pedidos Recibidos</h1>

      {pedidos.length === 0 ? (
        <p>No hay pedidos por ahora...</p>
      ) : (
        pedidos.map(pedido => (
          <TarjetaPedido key={pedido.id} pedido={pedido} />
        ))
      )}
    </div>
  );
};

export default Pedidos;
