// comensal/src/components/EstadoPedido.jsx
import React from 'react';

const EstadoPedido = ({ estado }) => {
  const colores = {
    'Recibido': '#fbbf24',
    'En preparación...': '#60a5fa',
    'Completado': '#4ade80',
    'Entregado': '#22c55e'
  };

  return (
    <div style={{
      backgroundColor: colores[estado] || '#e5e7eb',
      color: 'white',
      padding: '12px',
      borderRadius: '12px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '16px'
    }}>
      Estado del pedido: {estado}
    </div>
  );
};

export default EstadoPedido;
