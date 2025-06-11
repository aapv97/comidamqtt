import React, { useState, useEffect } from 'react';
import './TarjetaPedido.css';
import { mqttClient } from '../mqttClient';

const estados = ['Recibido', 'En preparación...', 'Completado', 'Entregado'];

const TarjetaPedido = ({ pedido }) => {
  const estadoInicial = pedido.estado && estados.includes(pedido.estado)
    ? pedido.estado
    : 'Recibido';

  const [estadoActual, setEstadoActual] = useState(estadoInicial);
  const [indiceEstado, setIndiceEstado] = useState(estados.indexOf(estadoInicial));
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // sincroniza si el estado en base cambia
    if (pedido.estado && pedido.estado !== estadoActual) {
      setEstadoActual(pedido.estado);
      setIndiceEstado(estados.indexOf(pedido.estado));
    }
  }, [pedido.estado]);

  const avanzarEstado = async () => {
    if (indiceEstado >= estados.length - 1 || enviando) return;

    const nuevoEstado = estados[indiceEstado + 1];
    setEnviando(true);

    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/${pedido.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) throw new Error('Error al actualizar estado en backend');

      mqttClient.publish(`ordenes/status/mesa1`, JSON.stringify({
        id: pedido.id,
        estado: nuevoEstado,
      }));

      setEstadoActual(nuevoEstado);
      setIndiceEstado(indiceEstado + 1);
    } catch (err) {
      console.error('❌ Error al avanzar estado:', err);
      alert('Error al actualizar estado');
    } finally {
      setEnviando(false);
    }
  };

  const fondo = {
    'Recibido': '#fff7e6',
    'En preparación...': '#ffecd1',
    'Completado': '#e0ffe6',
    'Entregado': '#e6f7ff'
  }[estadoActual] || '#f0f0f0';

  return (
    <div className="tarjeta-pedido" style={{ backgroundColor: fondo }}>
      <h3>🧾 Pedido #{pedido.id}</h3>
      <ul>
        {pedido.productos.map((p, i) => (
          <li key={i}>✅ {p.cantidad} × {p.nombre}</li>
        ))}
      </ul>

      {indiceEstado < estados.length - 1 ? (
        <button
          onClick={avanzarEstado}
          className={`btn-estado estado-${estadoActual.replace(/\s/g, '')}`}
          disabled={enviando}
        >
          {enviando ? 'Actualizando...' : `Marcar como "${estados[indiceEstado + 1]}"`}
        </button>
      ) : (
        <p className="entregado-msg">✅ Pedido entregado</p>
      )}
    </div>
  );
};

export default TarjetaPedido;
