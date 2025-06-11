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
    const handleMessage = (topic, message) => {
      const data = JSON.parse(message.toString());
  
      if (topic === 'nuevo/pedido') {
        const pedido = { ...data, estado: data.estado || 'Recibido' };
  
        setPedidos(prev => {
          const existe = prev.find(p => p.id === pedido.id);
          if (existe) return prev; // ya existe, no duplicar
          return [...prev, pedido];
        });
      }
  
      if (topic === 'ordenes/status/mesa1') {
        const { id, estado } = data;
        setPedidos(prev =>
          prev.map(p => (p.id === id ? { ...p, estado } : p))
        );
      }
    };
  
    mqttClient.on('connect', () => {
      console.log('👨‍🍳 Cocina conectada a MQTT');
      mqttClient.subscribe('nuevo/pedido');
      mqttClient.subscribe('ordenes/status/mesa1');
    });
  
    mqttClient.on('message', handleMessage);
  
    return () => {
      mqttClient.off('message', handleMessage); // muy importante para evitar múltiples handlers
    };
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
