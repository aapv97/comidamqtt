// 📁 Archivo: comidamqtt/backend/index.js

import express from 'express';
import cors from 'cors';
import mqtt from 'mqtt';
import mysql from 'mysql2/promise';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 🧠 Conexión a la base de datos
const db = await mysql.createConnection({
  host: 'mysql',       // El nombre del servicio en docker-compose
  user: 'root',
  password: 'password',
  database: 'comida'
});

// 📡 Conexión a MQTT Broker
const mqttClient = mqtt.connect('mqtt://broker:1883');
const MQTT_TOPIC_ESTADO = 'ordenes/status/mesa1';

mqttClient.on('connect', () => {
  console.log('✅ Backend conectado a MQTT');
});

// 🚀 API para obtener todos los pedidos
app.get('/pedidos', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM pedidos');
  res.json(rows);
});

// 📥 API para crear un nuevo pedido
app.post('/pedidos', async (req, res) => {
  const { productos } = req.body;
  const estado = 'Recibido';
  const [result] = await db.query('INSERT INTO pedidos (productos, estado) VALUES (?, ?)', [JSON.stringify(productos), estado]);

  // 🔔 Publicar por MQTT
  mqttClient.publish('pedidos', JSON.stringify({ id: result.insertId, productos }));

  res.status(201).json({ id: result.insertId, productos, estado });
});

// 🔄 API para actualizar el estado de un pedido
app.put('/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  await db.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);

  // 🛰️ Opcional: Notificar por MQTT
  mqttClient.publish(MQTT_TOPIC_ESTADO, JSON.stringify({ id, estado }));

  res.sendStatus(204);
});

// 🩺 Prueba de vida
app.get('/', (req, res) => {
  res.send('🌐 Backend API corriendo');
});

app.listen(port, () => {
  console.log(`🚀 API escuchando en http://localhost:${port}`);
});
