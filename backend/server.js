import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connection from './db.js';
import mqtt from 'mqtt';

dotenv.config();

const app = express();

// ✅ Configuración CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// 🟢 Conexión MQTT (para uso dentro de Docker)
const mqttClient = mqtt.connect('mqtt://mqtt:1883');

mqttClient.on('connect', () => {
  console.log('📡 Conectado al broker MQTT');

  mqttClient.subscribe('estado/pedido', (err) => {
    if (!err) {
      console.log('✅ Suscrito a estado/pedido');
    } else {
      console.error('❌ Error al suscribirse a estado/pedido:', err);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  console.log(`📥 Mensaje recibido en ${topic}: ${message.toString()}`);
  // Puedes manejar mensajes de actualización aquí si lo deseas
});

export { mqttClient };


// 📌 RUTAS API

app.get('/', (req, res) => {
  res.send('Servidor API funcionando 🍽️');
});

// GET: Obtener todos los pedidos
app.get('/api/pedidos', (req, res) => {
  connection.query('SELECT * FROM pedidos', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener pedidos:', err);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    } else {
      res.json(results);
    }
  });
});

// ✅ POST: Registrar nuevo pedido con estado inicial
app.post('/api/pedidos', (req, res) => {
  const productos = req.body.productos;

  if (!productos || !Array.isArray(productos)) {
    return res.status(400).json({ error: 'Formato inválido: se espera un arreglo de productos' });
  }

  const pedidoJSON = JSON.stringify(productos);
  const estado = 'Recibido'; // Estado inicial forzado

  connection.query(
    'INSERT INTO pedidos (productos, estado) VALUES (?, ?)',
    [pedidoJSON, estado],
    (err, result) => {
      if (err) {
        console.error('❌ Error al guardar el pedido:', err);
        return res.status(500).json({ error: 'Error al guardar el pedido' });
      }

      const nuevoPedido = {
        id: result.insertId,
        productos,
        estado
      };

      mqttClient.publish('nuevo/pedido', JSON.stringify(nuevoPedido));
      console.log('📤 Pedido enviado a cocina:', nuevoPedido);

      res.status(201).json(nuevoPedido);
    }
  );
});

// PUT: Actualizar el estado de un pedido por ID
app.put('/api/pedidos/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'Estado requerido' });
  }

  connection.query(
    'UPDATE pedidos SET estado = ? WHERE id = ?',
    [estado, id],
    (err, result) => {
      if (err) {
        console.error('❌ Error al actualizar estado:', err);
        return res.status(500).json({ error: 'Error al actualizar estado' });
      }

      res.json({ success: true, id, nuevoEstado: estado });
    }
  );
});

// 🟢 Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
